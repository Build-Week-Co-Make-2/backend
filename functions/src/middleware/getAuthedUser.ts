import * as functions from 'firebase-functions';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import Users from '../database/users';

export const getAuthedUser: RequestHandler = async (req, _res, next) => {
    const decoded: { email: string } = jwt.verify(
        req.headers.authorization as string,
        functions.config()['co-make'].jwt.secret,
    ) as { email: string };
    // get user doc
    Users.where('email', '==', decoded.email)
        .get()
        .then((docs) => {
            // we have user now
            const user = docs.docs.find(
                (doc) => doc.data().email === decoded.email,
            );

            return user;
        })
        .then((user) => {
            req.body.id = user?.id; // this is always going to be truthy regardless of typescript saying possible undefined bc of prev middlewares
            next();
        })
        .catch((err) => {
            next({ status: 500, message: 'Server error getting authed user' });
        });
};
