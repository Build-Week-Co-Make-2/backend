import * as functions from 'firebase-functions';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../database/users';

export const getAuthedUser: RequestHandler = async (req, _res, next) => {
    const decoded: { email: string } = jwt.verify(
        req.headers.authorization as string,
        functions.config()['co-make'].jwt.secret,
    ) as { email: string };
    try {
        const user = await User.getByEmail(decoded.email);
        req.body.user = user;
        next();
    } catch (e) {
        next({ status: 500, message: 'Server error getting authed user' });
    }
};
