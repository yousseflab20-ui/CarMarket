import "dotenv/config";
import { Sequelize } from "sequelize";

// Enhanced production detection for Railway
const isProduction = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_STATIC_URL;

let sequelize;

if (process.env.DATABASE_URL) {
  console.log("📡 Database: Using DATABASE_URL connection string");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: isProduction
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
      : {},
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  });
} else {
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || 5432;

  if (isProduction && host === "localhost") {
    console.warn("⚠️ WARNING: Detected production environment but host is set to 'localhost'. Database connection might fail if DATABASE_URL is missing.");
  }

  console.log(`📡 Database: Using individual variables (Host: ${host}, Port: ${port}, DB: ${process.env.DB_NAME})`);

  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: host,
    port: Number(port),
    dialect: "postgres",
    dialectOptions: isProduction
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
      : {},
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  });
}

export default sequelize;
