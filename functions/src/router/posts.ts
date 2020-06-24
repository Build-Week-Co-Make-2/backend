import { Router } from 'express';
import admin from 'firebase-admin';
import { authenticate } from '../middleware/authenticate';
import { getAuthedUser } from '../middleware/getAuthedUser';
import Posts, { PostDataModel } from '../database/posts';
import Users from '../database/users';
const router = Router();

// base route
router.use(authenticate, getAuthedUser); // checks for token immediately for all routes

type Owner = {
    email: string;
    zip: string;
    name: string;
};

interface OriginalPost {
    owner:
        | Owner
        | Promise<Owner>
        | Promise<
              FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
          >;
    title: string;
    description: string;
    upvotes: number;
    voted: string[];
}

/**
 * !TODO: There is a lot of copy/pasted code for shaping data, needs to be extracted into it's own function
 */

router
    .route('/')
    .get(async (req, res, next) => {
        // get posts and populate owner field of each post

        // get posts
        try {
            const posts = await Posts.get();

            // populate owner field
            // what does it mean to populate the owner field?
            // turn the id string into an object that represents the owner
            const postsData: Promise<OriginalPost>[] = posts.docs.map(
                async (post, index) => {
                    const ownerId = post.data().owner;
                    const owner = (await Users.doc(ownerId).get()).data();
                    return {
                        ...(post.data() as OriginalPost),
                        id: post.ref.id,
                        owner: {
                            email: owner?.email,
                            name: owner?.name,
                            zip: owner?.name,
                        },
                    } as OriginalPost;
                },
            );
            const promiseResults = await Promise.all(postsData);
            res.status(200).json(promiseResults);
        } catch (e) {
            console.log(e);
            next({ status: 500, message: 'Server error grabbing all posts' });
        }
    })
    .post(async ({ body: { title, description, user } }, res, next) => {
        // add a post, requires user.id
        // if we get here, req.body.id should contain user.id
        /**
         *  posts
         * -title
         * -description
         * -upvotes
         * -voted: [users.id]
         * -owner: users.id
         */
        try {
            const postCreateData = {
                title: title,
                description: description,
                upvotes: 0,
                voted: [],
                owner: user.id,
            };
            const post = await (await Posts.add(postCreateData)).get();
            const postData = post.data();

            await Users.doc(postData?.owner).update({
                posts: admin.firestore.FieldValue.arrayUnion(post.ref.id),
            }); // this will have an owner field
            const owner = (await Users.doc(postData?.owner).get()).data();
            // get the owner so that we can return an object with information on posts and owner

            const returnData = {
                ...postData,
                id: post.ref.id,
                owner: {
                    email: owner?.email,
                    zip: owner?.zip,
                    name: owner?.name,
                },
            };

            res.status(201).json(returnData);
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
        try {
            const postDocument = await Posts.doc(id).get();
            const postDocumentData = postDocument.data();
            const ownerDocument = (
                await Users.doc(postDocumentData?.owner).get()
            ).data();

            const post = {
                ...postDocumentData,
                id: postDocument.ref.id,
                owner: {
                    email: ownerDocument?.email,
                    zip: ownerDocument?.zip,
                    name: ownerDocument?.name,
                },
            };

            res.status(200).json(post);
        } catch (e) {
            console.log(e);
            next({
                status: 500,
                message: 'Server issue with grabbing specific post',
            });
        }
    })
    .put(
        async (
            { params: { id }, body: { title, description, user }, ...req },
            res,
            next,
        ) => {
            // We must only allow the owner to make updates to this document

            /**
             *  when updating a document, two fields must be present
             *  the title + description
             *  of course it's optional depending on the front end
             *  they could simply send in just a title and leave description intact or vice versa
             * */

            // Approach -> just update title and description so long as data is present
            if (!title || !description) {
                next({
                    status: 400,
                    message:
                        'Please supply the necessary title and/or description fields',
                });
                return;
            }

            try {
                const postDocument = await await Posts.doc(id).get();
                const postDocumentData = postDocument.data();

                // verify postDocument.owner is the authed user
                if (postDocumentData?.owner !== user.id) {
                    next({
                        status: 403,
                        message:
                            'Only the owner of a post may make changes to their documents',
                    });
                    return;
                }
                // if we get here then there is both a title and description
                // and the document owner and authed user matches
                //  so update them
                await Posts.doc(id).set(
                    { title, description },
                    { merge: true },
                );

                // retrieve the post
                const postDocumentOwner = await (
                    await Users.doc(postDocumentData?.owner).get()
                ).data();

                const post = {
                    ...postDocumentData,
                    title,
                    description,
                    id: postDocument.ref.id,
                    owner: {
                        email: postDocumentOwner?.email,
                        zip: postDocumentOwner?.zip,
                        name: postDocumentOwner?.name,
                    },
                };

                res.status(200).json(post);
            } catch (e) {
                console.log(e);
                next({ status: 500, message: 'Server error updating post' });
            }
        },
    )
    .delete(async ({ params: { id }, body: { user } }, res, next) => {
        try {
            const postDocument = await Posts.doc(id).get();
            const postDocumentData = postDocument.data();

            // verify postDocument.owner is the authed user
            if (postDocumentData?.owner !== user.id) {
                next({
                    status: 403,
                    message:
                        'Only the owner of a post may make changes to their documents',
                });
                return;
            }

            // remove reference to post.id in user.posts
            await Users.doc(postDocumentData?.owner).update({
                posts: admin.firestore.FieldValue.arrayRemove(
                    postDocument.ref.id,
                ),
            });

            await Posts.doc(postDocument.id).delete();
            res.status(200).json({ message: 'Post has been deleted' });
        } catch (e) {
            console.log(e);
            next({ status: 500, message: 'Server issue in deleting post' });
        }
    });

router
    .route('/:id/upvote')
    .put(async ({ params: { id: postId }, body: { user } }, res, next) => {
        // when the front end visits this end point, it will increment upvote after adding user id to voted
        // get post doc
        try {
            const postDocumentRef = Posts.doc(postId);
            const postData = (
                await postDocumentRef.get()
            ).data() as PostDataModel;
            const userVoted: string | undefined = postData.voted.find(
                (id) => id === user.id,
            );
            // check if user is inside voted
            if (!userVoted) {
                // if not
                // increment votes by 1

                await postDocumentRef.update({
                    voted: admin.firestore.FieldValue.arrayUnion(user.id),
                    upvotes: admin.firestore.FieldValue.increment(1),
                }); // this will have an owner field

                res.status(200).json({ message: 'Upvoted post' });
                return;
            }
            // send message stating user already voted and do nothing
            await postDocumentRef.update({
                voted: admin.firestore.FieldValue.arrayRemove(user.id),
                upvotes: admin.firestore.FieldValue.increment(-1),
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
