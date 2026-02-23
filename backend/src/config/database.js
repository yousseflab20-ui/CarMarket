import "dotenv/config";
import { Sequelize } from "sequelize";
// @ts-ignore
const isProduction = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;

let sequelize;

if (process.env.DATABASE_URL) {
  console.log("📡 Connecting to Database using DATABASE_URL");
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
  });
} else {
  console.log(`📡 Connecting to Database using individual variables... (Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT})`);
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
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
  });
}
console.log("log", process.env.DB_PORT)
export default sequelize;
