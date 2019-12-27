import { RequestHandler } from 'express';
import { Forbidden } from 'http-errors';
import Knex from 'knex';

import { ReqUser, UserRequest } from './middleware.d';

type GetUserHandler = (db: Knex, sessionId: number) => Promise<ReqUser | null>;

export const getUserBySessionId: GetUserHandler = async (db, sessionId) => {
  const row = await db('sessions')
    .where({ 'sessions.id': sessionId, 'users.disabled': 0 })
    .whereNull('ended_at')
    .innerJoin('users', 'users.id', 'sessions.user_id')
    .select(['users.name', 'users.id', 'users.role'])
    .first();
  return row ? { ...row } : null;
};

export const getUser: (db: Knex) => RequestHandler = db => (request, res, next) => {
  const req = request as UserRequest;
  const sessionId = req.session && req.session.id;
  if (sessionId) {
    getUserBySessionId(db, sessionId)
      .then(user => {
        if (user) {
          req.user = user;
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
};

export const requireAdmin: RequestHandler = (request, res, next) => {
  const req = request as UserRequest;
  if (!req.user || req.user.role !== 'admin') {
    next(new Forbidden());
  } else {
    next();
  }
};

export const requireUser: RequestHandler = (request, res, next) => {
  const req = request as UserRequest;
  if (!req.user) {
    next(new Forbidden());
  } else {
    next();
  }
};
