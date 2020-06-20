import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import authRouter from '../router/auth';
import postRouter from '../router/posts';
import errorHandler from '../middleware/errorHandler';

const server = express();
server.get('/', (req, res) => res.send('Hello World'));
server.use(cors({ origin: true })); // this was the issue with reaching past root @ /
server.use(helmet());
server.use(morgan('tiny'));

server.use('/api/posts', postRouter);
server.use('/api', authRouter);
server.use('/api/posts', postRouter);

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

server.use(errorHandler);

export default server;
