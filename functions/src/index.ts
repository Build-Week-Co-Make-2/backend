import * as functions from 'firebase-functions';
import server from './api';

export const app = functions.https.onRequest(server);
