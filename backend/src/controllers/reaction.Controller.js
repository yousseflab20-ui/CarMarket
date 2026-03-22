import reaction from "../models/Reaction.js";

export const Reaction = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("USER:", req.user);

    const { emoji } = req.body;
    const { messageId } = req.params;
    const userId = req.user.id;
    const existing = await reaction.findOne({
      where: { messageId, userId },
    });

    if (existing) {
      existing.emoji = emoji;
      await existing.save();
    } else {
      await reaction.create({ messageId, userId, emoji });
    }
    res.status(200).json({ message: "emoji valide" });
  } catch (error) {
    console.log("emoji field", error);
  }
};
