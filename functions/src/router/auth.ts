import * as functions from 'firebase-functions';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
    validateRegisterEmail,
    validateUser,
} from '../middleware/authValidation';
import Users, { User } from '../database/users';
const router = Router();

router.post(
    '/register/',
    validateRegisterEmail,
    async ({ body: { email, password, zip, name } }, res, next) => {
        const hash = bcrypt.hashSync(password);
        const data = {
            email,
            hash,
            zip,
            posts: [],
            name,
        };

        try {
            const userData = await User.create(data);
            const user = {
                email: userData.email,
                zip: userData.zip,
                name: userData.name,
            };
            res.status(201).json(user);
        } catch (e) {
            console.log(e);
            next({ status: 500, message: e.message });
        }
    },
);

router.post('/login', validateUser, async (req, res, next) => {
    // check for user token
    if (!req.body.user.token) {
        const token = jwt.sign(
            { email: req.body.user.email, id: req.body.user.id },
            functions.config()['co-make'].jwt.secret,
        );

        // update user in database to include token
        try {
            await Users.doc(req.body.user.id).set({ token }, { merge: true });
            res.status(200).json(token);
        } catch (e) {
            next({ status: 500, message: 'Server login dun goofed' });
        }
    }
    // if it does exist on user doc, we will verify it's still valid
    jwt.verify(
        req.body.user.token,
        functions.config()['co-make'].jwt.secret,
        async (err: any, decoded: any) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    // token expired == not valid
                    const token = jwt.sign(
                        { email: req.body.user.email, id: req.body.id },
                        functions.config()['co-make'].jwt.secret,
                    );
                    try {
                        await Users.doc(req.body.user.id).set(
                            { token },
                            { merge: true },
                        );
                        res.status(200).json(token);
                    } catch (e) {
                        next({
                            status: 500,
                            message: 'Server login dun goofed',
                        });
                    }
                    return; // should probably next it because something could go wrong besides token expired
                }
            }

            // if no errors
            res.status(200).json(req.body.user.token);
        },
    );
});

export default router;
