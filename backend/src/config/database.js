import "dotenv/config";
import { Sequelize } from "sequelize";
// @ts-ignore
const isProduction = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: isProduction
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
      : {},
  })
  : new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: isProduction
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
      : {},
  });
console.log("log", process.env.DB_PORT)
export default sequelize;
