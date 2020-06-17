import database from './setUp';

const Users = database.collection('users');

export const getUserWithEmail: (
    email: string,
) => Promise<
    FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
> = async (email: string) => {
    return await Users.where('email', '==', email).get();
};

export default Users;
