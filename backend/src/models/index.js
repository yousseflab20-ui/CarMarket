import User from "./User.js";
import Car from "./Car.js";
import Favorite from "./Favorite.js";
import Message from "./Message.js";
import Profile from "./Profile.js";

User.hasMany(Car, { foreignKey: "userId", onDelete: "CASCADE" });
Car.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Message, { foreignKey: "userId", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Profile, { foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
Car.hasMany(Favorite, { foreignKey: "carId", onDelete: "CASCADE" });

Favorite.belongsTo(User, { foreignKey: "userId" });
Favorite.belongsTo(Car, { foreignKey: "carId" });

export {
    User,
    Car,
    Favorite,
    Message,
    Profile
};
