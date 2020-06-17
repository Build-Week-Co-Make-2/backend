import * as functions from 'firebase-functions';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
    validateRegisterEmail,
} from '../middleware/authValidation';
const router = Router();

router.post(
    '/register/',
    validateRegisterEmail,
    async ({ body: { email, password, zip } }, res, next) => {
        const hash = bcrypt.hashSync(password);

        try {
            const userDocRef = await addUser({ email, hash, zip });
            const userDoc = await userDocRef.get();
            const userData = userDoc.data();
            const user = {
                email: userData?.email,
                zip: userData?.zip,
            };
            res.status(201).json(user);
        } catch (e) {
            next({ status: 500, message: 'Unexpected Server Error' });
        }
    },
);

export default router;
