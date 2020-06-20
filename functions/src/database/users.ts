import database from './';

export default Users;

export interface PublicUserDataModel {
    id: string;
    zip: string;
    email: string;
    name: string;
}

export interface UserInterface extends UserDataInterface {
    id: string;
}

export interface UserDataInterface {
    email: string;
    hash: string;
    zip: string;
    posts: string[];
    name: string;
    token?: string | undefined;
}

export class User implements UserInterface {
    id: string;
    email: string;
    hash: string;
    zip: string;
    posts: string[];
    name: string;
    token?: string | undefined;

    constructor(data: UserInterface) {
        const { email, hash, zip, posts, name, id, token } = data;
        this.id = id;
        this.email = email;
        this.name = name;
        this.hash = hash;
        this.zip = zip;
        this.posts = posts;
        this.token = token;
    }

    static getById = async (id: string): Promise<User> => {
        // get data
        try {
            const document = await database.collection('users').doc(id).get();
            if (document.exists) {
                const data = {
                    ...(document.data() as UserDataInterface),
                    id: document.id,
                };
                return new User(data);
            }
            throw Error('User does not exist');
        } catch (e) {
            throw Error(e.message);
        }
    };

    static create = async (data: UserDataInterface): Promise<User> => {
        try {
            if (data.zip.length !== 5) {
                throw Error('Zip length is not 5 characters');
            }
            try {
                const document = await (
                    await database.collection('users').add(data)
                ).get();
                const user = {
                    ...(document.data() as UserDataInterface),
                    id: document.id,
                };

                return new User(user);
            } catch (e) {
                throw Error('Server error creating user');
            }
        } catch (e) {
            throw Error(e.message);
        }
    };

    static getByEmail = async (email: string): Promise<User | undefined> => {
        try {
            const document = await database
                .collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (document.size === 1) {
                // there's a document
                const user = document.docs.find(
                    (doc) => (doc.data() as UserInterface).email === email,
                ) as FirebaseFirestore.QueryDocumentSnapshot<
                    FirebaseFirestore.DocumentData
                >;
                const data = { ...(user.data() as UserInterface), id: user.id };

                return new User(data);
            }
            throw Error(
                'There are two or more emails in the system and that cannot happen',
            );
        } catch (e) {
            throw Error(e.message);
        }
    };

    static getAll = async () => {
        const query = await database.collection('users').get(); // gets all docs
        const userDocs: User[] = query.docs.map((document) => {
            const user = new User({
                ...(document.data() as UserDataInterface),
                id: document.id,
            });
            return user;
        });
        return userDocs;
    };

    get data(): PublicUserDataModel {
        const { id, name, email, zip } = this;
        return {
            id,
            name,
            email,
            zip,
        };
    }
    // async create(): Promise<FirebaseFirestore.DocumentData> {
    //     // we have the data in data
    //     // we want to restrict zip to be 5 characters long
    //     if (data?.zip) throw new Error('Method not implemented.');
    // }
    // get(): Promise<FirebaseFirestore.DocumentData>[] {
    //     throw new Error('Method not implemented.');
    // }
    // update<T>(data: T): Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // delete(): Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // get data(): Promise<FirebaseFirestore.DocumentData> {
    //     throw new Error('Method not implemented.');
    // }
}
