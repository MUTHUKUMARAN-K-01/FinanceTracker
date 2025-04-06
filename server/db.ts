import { neon, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, financialProfiles, chatMessages, financialGoals } from '../shared/schema';

// Load environment variables
dotenv.config();

// Configure neon client
neonConfig.fetchConnectionCache = true;

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Function to drop all tables
async function dropAllTables() {
  console.log('Dropping all tables...');
  try {
    await sql`DROP TABLE IF EXISTS financial_goals CASCADE`;
    await sql`DROP TABLE IF EXISTS chat_messages CASCADE`;
    await sql`DROP TABLE IF EXISTS financial_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

// Initialize database with schema (this should be replaced with proper migrations)
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Test database connection
    await sql`SELECT 1`;
    console.log('Database connection successful');
    
    // Drop existing tables first
    await dropAllTables();
    
    // Create tables if they don't exist
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table initialized');

    // Financial profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS financial_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        monthly_income DECIMAL(12, 2),
        housing_expense DECIMAL(12, 2),
        transport_expense DECIMAL(12, 2),
        food_expense DECIMAL(12, 2),
        other_expenses DECIMAL(12, 2),
        savings_goal DECIMAL(12, 2),
        retirement_goal DECIMAL(12, 2),
        risk_tolerance VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Financial profiles table initialized');

    // Chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_user_message SMALLINT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Chat messages table initialized');

    // Financial goals table
    await sql`
      CREATE TABLE IF NOT EXISTS financial_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        target_amount DECIMAL(12, 2) NOT NULL,
        current_amount DECIMAL(12, 2) NOT NULL,
        deadline TIMESTAMP WITH TIME ZONE,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Financial goals table initialized');

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}