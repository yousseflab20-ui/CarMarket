import user from "./User.js";
import car from "./Car.js";
import favorite from "./Favorite.js";
import message from "./Message.js";
import profile from "./Profile.js";
import conversation from "./Conversation.js";
import Rating from "./Rating.js";
import reaction from "./Reaction.js";
import Settings from "./Settings.js";
import FAQ from "./FAQ.js";

user.hasMany(car, { foreignKey: "userId", onDelete: "CASCADE" });
car.belongsTo(user, { foreignKey: "userId" });

conversation.hasMany(message, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});
message.belongsTo(conversation, { foreignKey: "conversationId" });

user.hasMany(message, { foreignKey: "userId", onDelete: "CASCADE" });
message.belongsTo(user, { foreignKey: "userId", as: "sender" });

user.hasOne(profile, { foreignKey: "userId", onDelete: "CASCADE" });
profile.belongsTo(user, { foreignKey: "userId" });

user.hasMany(favorite, { foreignKey: "userId", onDelete: "CASCADE" });
car.hasMany(favorite, { foreignKey: "carId", onDelete: "CASCADE" });

favorite.belongsTo(user, { foreignKey: "userId" });
favorite.belongsTo(car, { foreignKey: "carId" });

user.hasMany(conversation, { foreignKey: "user1Id", onDelete: "CASCADE" });
user.hasMany(conversation, { foreignKey: "user2Id", onDelete: "CASCADE" });

conversation.belongsTo(user, { foreignKey: "user1Id", as: "user1" });
conversation.belongsTo(user, { foreignKey: "user2Id", as: "user2" });

user.hasMany(car, { foreignKey: "userId" });
car.belongsTo(user, { foreignKey: "userId" });

user.hasMany(Rating, { foreignKey: "sellerId", as: "sellerRatings" });
Rating.belongsTo(user, { foreignKey: "sellerId", as: "seller" });

user.hasMany(Rating, { foreignKey: "buyerId", as: "buyerRatings" });
Rating.belongsTo(user, { foreignKey: "buyerId", as: "buyer" });

message.hasMany(reaction, { foreignKey: "messageId" });

reaction.belongsTo(message, { foreignKey: "messageId" });
reaction.belongsTo(user, { foreignKey: "userId" });

user.hasMany(reaction, { foreignKey: "userId" });

user.hasOne(Settings, { foreignKey: "userId", onDelete: "CASCADE" });
Settings.belongsTo(user, { foreignKey: "userId" });
