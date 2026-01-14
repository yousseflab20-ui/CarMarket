import user from "./User.js";
import car from "./Car.js";
import favorite from "./Favorite.js";
import message from "./Message.js";
import profile from "./Profile.js";
import conversation from "./Conversation.js";
import Order from "./Order.js";

user.hasMany(car, { foreignKey: "userId", onDelete: "CASCADE" });
car.belongsTo(user, { foreignKey: "userId" });

conversation.hasMany(message, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});
message.belongsTo(conversation, { foreignKey: "conversationId" });

user.hasMany(message, { foreignKey: "userId", onDelete: "CASCADE" });
message.belongsTo(user, { foreignKey: "userId" });

user.hasOne(profile, { foreignKey: "userId", onDelete: "CASCADE" });
profile.belongsTo(user, { foreignKey: "userId" });

user.hasMany(favorite, { foreignKey: "userId", onDelete: "CASCADE" });
car.hasMany(favorite, { foreignKey: "carId", onDelete: "CASCADE" });

favorite.belongsTo(user, { foreignKey: "userId" });
favorite.belongsTo(car, { foreignKey: "carId" });

user.hasMany(conversation, { foreignKey: "user1Id", onDelete: "CASCADE" });
user.hasMany(conversation, { foreignKey: "user2Id", onDelete: "CASCADE" });

conversation.belongsTo(user, { foreignKey: "user1Id" });
conversation.belongsTo(user, { foreignKey: "user2Id" });
user.hasMany(car, { foreignKey: "userId" });
car.belongsTo(user, { foreignKey: "userId" });

// Orders relations
user.hasMany(Order, { foreignKey: "buyerId", as: "buyerOrders" });
user.hasMany(Order, { foreignKey: "sellerId", as: "sellerOrders" });

Order.belongsTo(user, { foreignKey: "buyerId", as: "buyer" });
Order.belongsTo(user, { foreignKey: "sellerId", as: "seller" });

car.hasMany(Order, { foreignKey: "carId" });
Order.belongsTo(car, { foreignKey: "carId", as: "car" });
export { user, car, favorite, message, profile, conversation, Order };
