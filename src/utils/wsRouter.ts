import { Request, RequestHandler, Response } from 'express';
import http from 'http';
import https from 'https';
import { Socket } from 'net';
import url from 'url';
import WebSocket from 'ws';

export type WSHandler = (ws: WebSocket, req: Request) => void;

type BaseServer = http.Server | https.Server;
type WSRoute = {
  middleware: RequestHandler[],
  wss: WebSocket.Server,
};
type WSRoutes = { [key: string]: WSRoute };

type WSRouteHandlerArgs = {
  head: Buffer,
  middleware: RequestHandler[],
  req: Request,
  socket: Socket,
  wss: WebSocket.Server,
};

type MyRef = {
  current?: any,
};

const fakeRes = {
  getHeader() {
    return '';
  },
  // tslint:disable-next-line: no-empty
  setHeader() {
  },
} as unknown as Response;

const routeHandler = ({
  head,
  middleware,
  req,
  socket,
  wss,
}: WSRouteHandlerArgs) => {
  const mw = [...middleware];
  const handle: MyRef = {};
  handle.current = (err?: Error) => {
    if (err) {
      socket.destroy();
    } else if (mw.length > 0) {
      const f = mw.shift();
      if (f) {
        f(req, fakeRes, handle.current);
      }
    } else {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  };
  handle.current();
};

const init = (server: BaseServer) => {
  const routes: WSRoutes = {};

  server.on('upgrade', (req, socket, head) => {
    const path = url.parse(req.url).pathname;
    if (!path) {
      socket.destroy();
      return;
    }
    const route = routes[path];
    if (route) {
      const { middleware, wss } = route;
      routeHandler({
        head,
        middleware,
        req,
        socket,
        wss,
      });
    } else {
      socket.destroy();
    }
  });

  return {
    path: (path: string, middleware: RequestHandler[], handler: WSHandler) => {
      const wss = new WebSocket.Server({ noServer: true });
      routes[path] = { middleware, wss };
      wss.on('connection', handler as unknown as WSHandler);
    },
  };
};

export default init;
