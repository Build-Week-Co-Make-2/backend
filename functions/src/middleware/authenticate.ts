import * as functions from 'firebase-functions';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate: RequestHandler = async (req, _res, next) => {
    if (!req.headers.authorization) {
        next({
            status: 403,
            message: 'Operation requires authenticated use. Please sign in',
        });
        return;
    }
    try {
        const decoded = jwt.verify(
            req.headers.authorization,
            functions.config()['co-make'].jwt.secret,
        );
        if (decoded) {
            // if we get here then there is something in the authorization header
            // and a token was present and verified

            next();
            return;
        }
        next({
            status: 403,
            message: 'Operation requires authenticated use. Please sign in',
        });
    } catch (e) {
        console.log(e);
        next({ status: 403, message: 'Token has issues, please sign in.' });
    }
};
