import BlockedUsers from "../models/BlockedUsers.js";

export const blockUser = async (req, res) => {
  const userAId = req.user.id; // logged user
  const userBId = req.body.blockedId; // user to block
  try {
    if (!userAId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!userBId || !userAId) {
      return res
        .status(400)
        .json({ message: "blockedId and blockerId are required" });
    }

    // Check if the user is trying to block themselves
    const isBlocked = await BlockedUsers.findOne({
      where: {
        blockerId: userAId,
        blockedId: userBId,
      },
    });

    if (isBlocked) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    const newBlock = await BlockedUsers.create({
      blockerId: userAId,
      blockedId: userBId,
    });

    res
      .status(201)
      .json({ message: "User blocked successfully", block: newBlock });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error blocking user", error: error.message });
  }
};
