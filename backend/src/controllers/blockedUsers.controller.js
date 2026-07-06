import BlockedUsers from "../models/BlockedUsers.js";
import user from "../models/user.js";

export const blockUser = async (req, res) => {
  const userAId = req.user.id; // logged user
  const userBId = parseInt(req.params.blockedId) || req.body?.blockedId; // user to block
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

    if (req.io) {
      req.io.to(userBId.toString()).emit("user_blocked_me", { blockerId: userAId });
    }

    res
      .status(201)
      .json({ message: "User blocked successfully", block: newBlock });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error blocking user", error: error.message });
  }
};

export const getBlockedList = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedList = await BlockedUsers.findAll({
      where: { blockerId },
      include: [
        {
          model: user,
          as: "blocked",
          attributes: ["id", "name", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, data: blockedList });
  } catch (error) {
    console.error("getBlockedList error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getBlockStatus = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = parseInt(req.params.blockedId);
    const [isBlocked, isBlockedBy] = await Promise.all([
      BlockedUsers.findOne({
        where: { blockerId: myId, blockedId: otherUserId },
      }),
      BlockedUsers.findOne({
        where: { blockerId: otherUserId, blockedId: myId },
      }),
    ]);
    return res.status(200).json({
      success: true,
      isBlocked: !!isBlocked,
      isBlockedBy: !!isBlockedBy,
    });
  } catch (error) {
    console.error("getBlockStatus error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = parseInt(req.params.blockedId);
    const block = await BlockedUsers.findOne({
      where: { blockerId, blockedId },
    });
    if (!block) {
      return res.status(404).json({ message: "Block not found." });
    }
    await block.destroy();

    if (req.io) {
      req.io.to(blockedId.toString()).emit("user_unblocked_me", { blockerId });
    }

    return res
      .status(200)
      .json({ success: true, message: "User unblocked successfully." });
  } catch (error) {
    console.error("unblockUser error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
