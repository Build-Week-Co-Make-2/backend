import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../co-make-9cf46-firebase-adminsdk-z1cod-899b85e3fa.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: 'https://co-make-9cf46.firebaseio.com',
});

const db = admin.firestore();
export default db;
