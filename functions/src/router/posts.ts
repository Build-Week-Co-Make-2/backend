import { Router } from 'express';
import admin from 'firebase-admin';
import { authenticate } from '../middleware/authenticate';
import { getAuthedUser } from '../middleware/getAuthedUser';
import Posts, { PostDataModel, Post } from '../database/posts';
import Users, { PublicUserDataModel } from '../database/users';
const router = Router();

// base route
router.use(authenticate, getAuthedUser); // checks for token immediately for all routes

/**
 * !TODO: There is a lot of copy/pasted code for shaping data, needs to be extracted into it's own function
 */

router
    .route('/')
    .get(async (req, res, next) => {
        // get posts and populate owner field of each post

        // get posts
        try {
            const posts = await Post.getAll();
            res.status(200).json(posts);
        } catch (e) {
            console.log(e);
            next({ status: 500, message: 'Server error grabbing all posts' });
        }
    })
    .post(async ({ body: { title, desc, user, state, zip } }, res, next) => {
        // add a post, requires user.id
        // if we get here, req.body.id should contain user.id
        /**
         *  posts
         * -title
         * -desc
         * -votes
         * -voted: [users.id]
         * -owner: users.id
         */
        try {
            const postCreateData: PostDataModel = {
                title,
                desc,
                votes: 0,
                voted: [],
                owner: user.id as string,
                state,
                zip,
            };

            const post = await Post.create(postCreateData);
            const postData = await post.data;
            try {
                await Users.doc(
                    (postData.owner as PublicUserDataModel).id,
                ).update({
                    posts: admin.firestore.FieldValue.arrayUnion(postData.id),
                });
                res.status(201).json(postData);
            } catch (e) {
                console.log(e);
                next({
                    status: 500,
                    message: 'Server issue updating user doc',
                });
            }
        } catch (e) {
            console.log(e);
            next({ status: 500, message: 'Server issue creating post' });
        }
    });

// base route/:id params for read/update/delete
router
    .route('/:id')
    .get(async ({ params: { id } }, res, next) => {
        // get specific post
        console.log(id);
        try {
            const post = await Post.getById(id);

            try {
                const postData = await post.data;
                res.status(200).json(postData);
            } catch (e) {
                throw Error(e.message);
            }
        } catch (e) {
            next({
                status: 500,
                message: e.message,
            });
        }
    })
    .put(
        async (
            { params: { id }, body: { title, desc, user, zip, state }, ...req },
            res,
            next,
        ) => {
            // We must only allow the owner to make updates to this document

            /**
             *  when updating a document, two fields must be present
             *  the title + desc
             *  of course it's optional depending on the front end
             *  they could simply send in just a title and leave desc intact or vice versa
             * */

            // Approach -> just update title and desc so long as data is present
            if (
                !title ||
                !desc ||
                !zip ||
                (!state && (zip as string).length !== 5)
            ) {
                next({
                    status: 400,
                    message: 'Please supply the necessary fields',
                });
                return;
            }

            try {
                const post = await Post.getById(id);
                try {
                    const postData = await post.data;

                    // verify postDocument.owner is the authed user
                    if (
                        (postData.owner as PublicUserDataModel).id !== user.id
                    ) {
                        next({
                            status: 403,
                            message:
                                'Only the owner of a post may make changes to their documents',
                        });
                        return;
                    }
                    // if we get here then there is both a title and desc
                    // and the document owner and authed user matches
                    //  so update them
                    try {
                        await Posts.doc(id).update({ title, desc, zip, state });

                        // retrieve the post

                        res.status(200).json({
                            ...postData,
                            title,
                            desc,
                            zip,
                            state,
                        });
                    } catch (e) {
                        throw Error('Server issue updating post data');
                    }
                } catch (e) {
                    throw Error(e.message);
                }
            } catch (e) {
                console.log(e);
                next({ status: 500, message: e.message });
            }
        },
    )
    .delete(async ({ params: { id }, body: { user } }, res, next) => {
        try {
            const post = await Post.getById(id); // checks for whether post exists
            try {
                const postData = await post.data;

                // verify postDocument.owner is the authed user
                if ((postData.owner as PublicUserDataModel).id !== user.id) {
                    next({
                        status: 403,
                        message:
                            'Only the owner of a post may make changes to their documents',
                    });
                    return;
                }

                // verify postDocument.owner is the authed user

                // remove reference to post.id in user.posts
                try {
                    await Users.doc(
                        (postData.owner as PublicUserDataModel).id,
                    ).update({
                        posts: admin.firestore.FieldValue.arrayRemove(
                            postData.owner,
                        ),
                    });
                    try {
                        const writeTime = await Post.delete(id);
                        res.status(200).json({
                            message: `Post has been deleted at ${writeTime
                                .toDate()
                                .toLocaleString()}`,
                        });
                    } catch (e) {
                        console.log(e);
                        throw Error('Error attempted to delete post document');
                    }
                } catch (e) {
                    console.log(e);
                    throw Error(
                        'Error attempting to update owner with removal of post',
                    );
                }
            } catch (e) {
                console.log(e);
                throw Error(
                    'Error getting postData while processing delete request',
                );
            }
        } catch (e) {
            console.log(e);
            next({ status: 500, message: e.message });
        }
    });

router
    .route('/:id/upvote')
    .put(async ({ params: { id: postId }, body: { user } }, res, next) => {
        // when the front end visits this end point, it will increment upvote after adding user id to voted
        // get post doc
        try {
            const post = await Post.getById(postId);
            const postData = await post.data;
            const userVoted: string | undefined = postData.voted.find(
                (id) => id === user.id,
            );
            // check if user is inside voted
            if (!userVoted) {
                // if not
                // increment votes by 1

                await Posts.doc(postId).update({
                    voted: admin.firestore.FieldValue.arrayUnion(user.id),
                    votes: admin.firestore.FieldValue.increment(1),
                }); // this will have an owner field

                res.status(200).json({ message: 'Upvoted post' });
                return;
            }
            // send message stating user already voted and do nothing
            await Posts.doc(postId).update({
                voted: admin.firestore.FieldValue.arrayRemove(user.id),
                votes: admin.firestore.FieldValue.increment(-1),
            });
            res.status(200).json({ message: 'Removed upvote' });
        } catch (e) {
            console.log(e);
            next({
                status: 500,
                message: 'Server dun goofed trying to upvote this post',
            });
        }
    });

export default router;
