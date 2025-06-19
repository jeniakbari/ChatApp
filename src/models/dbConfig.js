import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
// dotenv.config();

import { fileURLToPath } from 'url';

// Get the absolute path to the root .env file from the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up to the project root (adjust '../..' if needed)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });


const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD || '',
  dialect: "mysql", 
  logging: false,
});

export default sequelize;
