import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDB = async () => {
  try {
    console.log('🔄 Setting up database schema...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('FARMER', 'GOVERNMENT')) NOT NULL DEFAULT 'FARMER',
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);
    console.log('✅ Users table created');

    // Risk data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS risk_data (
        province_id VARCHAR(50) PRIMARY KEY,
        salinity_level FLOAT DEFAULT 0,
        heat_index FLOAT DEFAULT 0,
        flood_depth FLOAT DEFAULT 0,
        pollution_index FLOAT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INT REFERENCES users(id)
      );
    `);
    console.log('✅ Risk data table created');

    // Forecasts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forecasts (
        id SERIAL PRIMARY KEY,
        time_horizon VARCHAR(20) CHECK (time_horizon IN ('ULTRA_SHORT', 'SHORT', 'MEDIUM', 'LONG')),
        phenomenon VARCHAR(50) CHECK (phenomenon IN ('RAIN', 'STORM', 'MONSOON', 'POLLUTION', 'OTHER')),
        province_id VARCHAR(50),
        risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INT REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_forecasts_horizon ON forecasts(time_horizon);
    `);
    console.log('✅ Forecasts table created');

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user_id INT REFERENCES users(id) NOT NULL,
        to_role VARCHAR(20) CHECK (to_role IN ('FARMER', 'GOVERNMENT')),
        subject VARCHAR(200),
        content TEXT NOT NULL,
        status VARCHAR(20) CHECK (status IN ('SENT', 'READ', 'RESPONDED')) DEFAULT 'SENT',
        response_content TEXT,
        response_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(to_role, created_at);
    `);
    console.log('✅ Messages table created');

    // Permissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR(20),
        action VARCHAR(50),
        resource VARCHAR(100),
        UNIQUE(role, action, resource)
      );
    `);
    console.log('✅ Permissions table created');

    // Insert default permissions
    await pool.query(`
      INSERT INTO permissions (role, action, resource) VALUES
      ('FARMER', 'view_map', 'map'),
      ('FARMER', 'view_knowledge', 'knowledge_page'),
      ('FARMER', 'send_message', 'messages'),
      ('GOVERNMENT', 'input_data', 'risk_data'),
      ('GOVERNMENT', 'view_inbox', 'messages')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Permissions seeded');

    // Insert demo data
    await pool.query(`
      INSERT INTO risk_data (province_id, salinity_level, heat_index, flood_depth, pollution_index) 
      VALUES 
        ('CT', 25.5, 32.1, 0.5, 45.0),
        ('AG', 35.8, 31.5, 1.2, 38.0),
        ('CM', 42.3, 33.2, 0.3, 52.0)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Demo risk data inserted');

    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
};

setupDB();
