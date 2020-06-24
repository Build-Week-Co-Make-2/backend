import database from './setUp';
import { User, PublicUserDataModel } from './users';

export interface PostDataModel {
    desc: string;
    owner: string | PublicUserDataModel;
    title: string;
    votes: number;
    voted: string[];
    state: string;
    zip: string;
}

export interface PostModel extends PostDataModel {
    id: string;
}

const Posts = database.collection('posts');

export default Posts;

export class Post implements PostModel {
    id: string;
    desc: string;
    owner: string | PublicUserDataModel;
    title: string;
    votes: number;
    voted: string[];
    state: string;
    zip: string;

    constructor({
        id,
        desc,
        owner,
        title,
        voted,
        votes,
        state,
        zip,
    }: PostModel) {
        this.id = id;
        this.desc = desc;
        this.title = title;
        this.voted = voted;
        this.votes = votes;
        this.owner = owner as string;
        this.state = state;
        this.zip = zip;
    }

    static getById = async (id: string) => {
        try {
            const document = await database.collection('posts').doc(id).get();

            if (!document.exists)
                throw Error(`ReferenceError: Unable to find post with ${id}`);

            const postData = {
                ...(document.data() as PostDataModel),
                id: document.ref.id,
            };
            const post = new Post(postData);
            return post;
        } catch (e) {
            throw Error(e.message);
        }
    };

    static create = async (data: PostDataModel) => {
        try {
            const document = await database.collection('posts').add(data);
            if (!document.path) {
                throw Error('No path');
            }
            try {
                const postDocument = await document.get();
                const postData = {
                    ...(postDocument.data() as PostDataModel),
                    id: document.id,
                };
                return new Post({ ...postData });
            } catch (e) {
                throw Error(
                    'Server could not get information post adding post document',
                );
            }
        } catch (e) {
            throw Error('Server could not add post');
        }
    };

    static delete = async (id: string) => {
        try {
            // when we get here, we will have already verified that the owner of the post === user
            return (await database.collection('posts').doc(id).delete())
                .writeTime;
        } catch (e) {
            throw Error(e.message);
        }
    };

    get data(): Promise<Post> {
        console.log(this);
        return User.getById(this.owner as string)
            .then((owner) => {
                return new Post({
                    ...this,
                    owner: owner.data,
                });
            })
            .catch((e) => {
                console.log(e);
                throw Error(e.message);
            });
    }
}
