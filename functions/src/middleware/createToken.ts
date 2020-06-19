import * as functions from 'firebase-functions';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const generateToken = (user: { email?: string; zip?: string; id?: string }) => {
    let token;
    jwt.sign(
        { email: user.email, zip: user.zip, id: user.id },
        functions.config().jwt.secret,
        {
            expiresIn: '7d',
        },
        (err, encoded) => {
            if (err) throw Error(err.message);
            token = encoded;
        },
    );
    return token;
};

export const createToken: RequestHandler = (req, res, next) => {
    // user is attached from previous middleware validateUser
    const user: FirebaseFirestore.DocumentData = req.body.user;

    // check if user has a token
    if (user.token) {
        console.log('user has token');
        jwt.verify(
            user.token,
            functions.config().jwt.secret,
            (err: any, _decoded: any) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        // generate new token
                        try {
                            const tokenIfExpired = generateToken(user);
                            req.headers.authorization = tokenIfExpired;
                            next();
                        } catch (e) {
                            next({
                                status: 500,
                                message: `Could not create token, ${e}`,
                            });
                        }
                    }
                }
                // there must be no errors with token if we get here
                req.headers.authorization = user.token;
                next(); // no need to generate token if there is a valid token
                return;
            },
        );
    }
    console.log('user does not have token');
    // if no token, meaning first time login most likely
    try {
        const token = generateToken(user);
        req.headers.authorization = token;
        next();
    } catch (e) {
        next({
            status: 500,
            message: `Could not create token, ${e}`,
        });
    }
};
