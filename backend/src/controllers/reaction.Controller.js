import reaction from "../models/Reaction.js";

export const Reaction = async () => {
  try {
    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("USER:", req.user);

    const { emoji } = req.body;
    const { messageId } = req.params;
    const userId = req.user.id;
    const existing = await Reaction.findOne({
      where: { messageId, userId },
    });

    if (existing) {
      existing.emoji = emoji;
      await existing.save();
    } else {
      await Reaction.create({ messageId, userId, emoji });
    }
  } catch (error) {
    console.log("emoji field", error);
  }
};
