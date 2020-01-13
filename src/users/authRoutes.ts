import bcrypt from 'bcrypt';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequest, Forbidden } from 'http-errors';
import Knex from 'knex';

import { getUser } from './middleware';
import { UserRequest } from './middleware.d';

const fakeDelay = () => bcrypt.compare('password', '$2a$10$ACH56m/KfwKmaj8pBSVf/OhF5X1LLc0Rt7eYXpfyYiRy/Fx8azLEy');

const makeAuthRouter = (db: Knex) => {
  const router = Router();

  router.get('/', getUser(db), (req, res) => {
    const { user } = req as UserRequest;
    if (!user) {
      res.json({});
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
    });
  });

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const r = req as UserRequest;
      const { login, password } = req.body;
      if (!login || !password) {
        throw new BadRequest();
      }
      const user = await db('users')
        .where({ login, deleted: 0, disabled: 0 })
        .first();
      if (!user) {
        await fakeDelay();
        throw new Forbidden('Incorrect username or password');
      }
      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        throw new Forbidden('Incorrect username or password');
      }
      const now = new Date();
      const session = {
        created_at: now,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        updated_at: now,
        user_agent: req.headers['user-agent'],
        user_id: user.id,
      };
      const [sessionId] = await db('sessions').insert(session);
      if (r.session) {
        r.session.id = sessionId;
      }
      res.json({
        id: user.id,
        name: user.name,
        role: user.role,
      });
    }),
  );

  router.post(
    '/logout',
    asyncHandler(async (req, res) => {
      const r = req as UserRequest;
      if (r.session) {
        if (r.session.id) {
          await db('sessions')
            .where({ id: r.session.id })
            .update({
              ended_at: new Date(),
            });
        }
        r.session.id = null;
      }
      res.json({});
    }),
  );

  return router;
};

export default makeAuthRouter;
