import express from "express"
import cors from "cors"
import sequelize from "./src/config/database.js"
const app = express()
app.use(cors())
app.use(express.json())
sequelize.authenticate()
    .then(() => console.log("server conected"))
    .catch(err => console.log("server no connectd", err))
