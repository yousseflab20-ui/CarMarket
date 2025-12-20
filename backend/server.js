import express from "express"
import cors from "cors"
import sequelize from "./src/config/database.js"
import "./src/models/index.js";
const app = express()
app.use(cors())
app.use(express.json())
const PORT = 5000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connected");

        await sequelize.sync();
        console.log("DB synced");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("DB connection failed:", err);
    }
})();