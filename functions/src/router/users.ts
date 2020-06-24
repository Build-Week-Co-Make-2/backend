import { authenticate } from '../middleware/authenticate';
import { User } from '../database/users';

import { Router } from 'express';
import { getAuthedUser } from '../middleware/getAuthedUser';
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
    .delete(
        getAuthedUser,
        async ({ params: { id }, body: { user } }, res, next) => {
            // you can only delete users if that user is you
            try {
                if (id === user.id) {
                    const removeTime = await User.remove(id);
                    res.status(200).json({
                        message: `User has been removed at ${new Date(
                            removeTime,
                        ).toLocaleString()}`,
                    });
                    return;
                }
                next({
                    status: 403,
                    message: 'Only the owner may delete their account',
                });
            } catch (e) {
                console.log(e);
                next({ status: 500, message: 'Server issue removing user' });
            }
        },
    );

export default router;
