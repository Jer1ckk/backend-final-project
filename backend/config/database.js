const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 30000
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /TIMEOUT/
      ],
      max: 3
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${process.env.DB_HOST}`);
    
    // Only sync tables when starting server (not during seeding)
    if (process.env.NODE_ENV === 'development' && !process.env.SEEDING_MODE) {
      const syncMode = process.env.DB_SYNC_MODE || 'safe';
      
      if (syncMode === 'force') {
        // Complete rebuild (dangerous - will drop existing data)
        await sequelize.sync({ force: true });
        console.log('Database tables recreated (force mode)');
      } else if (syncMode === 'alter') {
        // Alter existing tables (can cause index issues)
        await sequelize.sync({ alter: true });
        console.log('Database tables altered');
      } else {
        // Safe mode - only create tables if they don't exist
        await sequelize.sync({ force: false, alter: false });
        console.log('Database tables synchronized (safe mode)');
      }
    } else if (process.env.SEEDING_MODE) {
      console.log('Skipping auto-sync (seeding mode active)');
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
