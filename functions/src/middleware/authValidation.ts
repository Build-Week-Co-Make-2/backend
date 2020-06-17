import { RequestHandler } from 'express';
import { getUserWithEmail } from '../database/users';
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
