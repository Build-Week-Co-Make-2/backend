import database from './setUp';

export interface PostDataModel {
    description: string;
    owner: string;
    title: string;
    upvotes: number;
    voted: string[];
}

const Posts = database.collection('posts');

export default Posts;
