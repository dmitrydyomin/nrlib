import { ErrorRequestHandler } from 'express';
import { HttpError } from 'http-errors';

const jsonErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      code: err.statusCode,
      error: err.message,
    });
  } else {
    res.status(500).json({
      error: 'Іnternal Server Error',
      statusCode: 500,
    });
    throw err;
  }
};

export default jsonErrorMiddleware;
