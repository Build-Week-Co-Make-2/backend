import { authenticate } from '../middleware/authenticate';
import { User } from '../database/users';

import { Router } from 'express';
const router = Router();

router.use(authenticate);
// base route
router.route('/').get(async (req, res, next) => {
    // gets all users
    try {
        const users = (await User.getAll()).map((user) => user.data);
        res.status(200).json(users);
    } catch (e) {
        console.log(e);
        next({ status: 500, message: 'Server issue getting users' });
    }
});
//   .post(async (req, res) => {});

// base route/:id params for read/update/delete
router
    .route('/:id')
    .get(async ({ params: { id } }, res, next) => {
        try {
            const user = (await User.getById(id)).data;
            res.status(200).json(user);
        } catch (e) {
            console.log(e);
            next({
                status: 500,
                message: 'Server issue retrieving user by id',
            });
        }
    })
    //   .put(async ({params: {id}}, res) => {})
    .delete(async ({ params: { id } }, res) => {
        // you can only delete users if that user is you
    });

export default router;
