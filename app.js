import dotenv from 'dotenv';
import Server from './models/server.js';

dotenv.config();
console.log(process.env.OPENAI_API_KEY);

const server = new Server();
server.start();
