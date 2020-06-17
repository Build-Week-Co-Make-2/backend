import database from './setUp';

type AddUserType = {
    email: string;
    hash: string;
    zip: string;
};

type AddUserCallback = (
    user: AddUserType,
) => Promise<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
>;

const Users = database.collection('users');

export const getUserWithEmail: (
    email: string,
) => Promise<
    FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
> = async (email: string) => {
    return await Users.where('email', '==', email).get();
};

export const addUser: AddUserCallback = async (user: AddUserType) => {
    const docRef = await Users.add(user);
    return docRef;
};

export default Users;
