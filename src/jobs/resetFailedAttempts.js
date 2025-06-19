import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
// dotenv.config();
import sequelize from '../models/dbConfig.js';
import { User } from '../models/usersModel.js';


const reset = async () => {
  try {
    console.log('Loaded ENV:', {
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_HOST: process.env.DB_HOST,
    });

    await sequelize.authenticate();
    console.log('Database connected');

    await User.update(
      { failed_attempts: 0 },
      { where: {} }
    );

    console.log('Failed attempts reset for all users');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

reset()
  .then(() => console.log('Reset completed'))
  .catch(err => console.error('Reset failed:', err));
