import EventEmitter from 'events';
import { Request } from 'express';
import WebSocket from 'ws';

import { UserRequest } from '../users/middleware.d';

export const bus = new EventEmitter();

const clients: WebSocket[] = [];

export const wsHandler = (ws: WebSocket, req: Request) => {
  const r = req as UserRequest;
  if (!r.user) {
    ws.close();
    return;
  }
  const { id } = r.user;

  ws.on('message', (data: string) => {
    try {
      const { type, payload } = JSON.parse(data);
      bus.emit(`ui.${type}`, { id, payload });
    } catch (err) {
      ws.send(`Failed to parse incoming message as JSON`);
    }
  });

  ws.on('close', () => {
    clients.splice(clients.indexOf(ws));
  });

  clients.push(ws);
};

export const broadcast = (type: string, payload: any) => {
  const message = JSON.stringify({ type, payload });
  clients.forEach(cl => cl.send(message));
};
