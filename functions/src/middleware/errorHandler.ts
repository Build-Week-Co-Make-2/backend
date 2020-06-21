import { ErrorRequestHandler } from 'express';

type ErrorRequestType = {
    status: number;
    message: string;
};

const errorHandler: ErrorRequestHandler = (
    err: ErrorRequestType,
    _req,
    res,
    _next,
) => {
    res.status(err.status).json(err.message);
};

export default errorHandler;
