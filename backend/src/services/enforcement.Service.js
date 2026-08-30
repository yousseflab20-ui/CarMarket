import car from "../models/Car.js";
import Negotiation from "../models/Negotiation.js";
import { Op } from "sequelize";

/**
 * Applied when an admin BLOCKS a user.
 * - Hides all AVAILABLE listings
 * - Cancels all ACTIVE negotiations (as buyer OR seller)
 */
export const applyBlockedEffects = async (userId) => {
  // 1. Hide all AVAILABLE cars of this user
  await car.update(
    { isHidden: true },
    { where: { userId, status: "AVAILABLE" } }
  );

  // 2. Cancel all ACTIVE negotiations where user is buyer OR seller
  await Negotiation.update(
    { status: "CANCELLED" },
    {
      where: {
        status: "ACTIVE",
        [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
      },
    }
  );
};

/**
 * Applied when an admin RESTRICTS a user.
 * - User keeps read-only access (browse, view cars, view history)
 * - Cannot create cars or make offers (enforced via requireActiveUser middleware)
 * - No side-effects needed on existing data
 */
export const applyRestrictedEffects = async (_userId) => {
  // Intentionally empty — restrictions are enforced at the middleware level
  // See: requireActiveUser middleware (Phase 3)
};
