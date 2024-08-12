const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `.env.${env}` });

console.log('Server Port:', process.env.SERVER_PORT);
console.log('Loaded Environment:', process.env.NODE_ENV_ID);