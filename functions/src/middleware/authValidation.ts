import { RequestHandler } from 'express';
import { getUserWithEmail } from '../database/users';
import bcrypt from 'bcryptjs';

export const validateRegisterEmail: RequestHandler = async (
    req,
    _res,
    next,
) => {
    // check for existing users
    const { email } = req.body;
    try {
        const users = await getUserWithEmail(email);
        const user = users.docs
            .find((doc) => doc.data().email === email)
            ?.data();
        if (user) {
            next({
                status: 400,
                message: 'Email already exists in the system',
            });
        }
        next();
    } catch (e) {
        next({ status: 500, message: 'Unexpected server response' });
    }
};

export const validateUser: RequestHandler = async (req, _res, next) => {
    const { email } = req.body;
    try {
        const users = await getUserWithEmail(email);
        const user = users.docs.find((doc) => doc.data().email === email);
        if (user) {
            // validate password here and now
            const valid = bcrypt.compareSync(
                req.body.password,
                user.data().hash,
            );
            if (valid) {
                req.body.user = user.data();
                req.body.id = user.ref.id;
                next();
                return;
            }
            next({
                status: 400,
                message: 'Email or Password incorrect',
            });
        }
        next({
            status: 400,
            message: 'Email or Password incorrect',
        });
    } catch (e) {
        next({ status: 500, message: 'Unexpected server response' });
    }
};
