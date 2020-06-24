import * as functions from 'firebase-functions';
import server from './api';
import Posts from './database/posts';

export const app = functions.https.onRequest(server);
export const onDeleteUser = functions.firestore
    .document('/users/{id}')
    .onDelete(async (snapshot, context) => {
        // grab id out of context
        const id = context.params?.id;

        if (!id) return; // just fyi, id will always be here but for type checking purposes this will be put here

        // now grab all posts where owner === id
        (await Posts.where('owner', '==', id).get()).forEach(async (doc) => {
            await doc.ref.delete();
        });
    });
