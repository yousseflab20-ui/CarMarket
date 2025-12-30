import pkg from 'sequelize';
const { Sequelize } = pkg;
import dotenv from "dotenv"
dotenv.config()
console.log(process.env.DB_PORT)
const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres"
})
export default sequelize