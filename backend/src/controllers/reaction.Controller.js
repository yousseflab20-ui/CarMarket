import reaction from "../models/Reaction";

export const Reaction = async () => {
  const { emoji } = req.body;
  const { messageId } = req.params;
  const userId = req.user.id;
  try {
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
