import SavedSearch from "../models/SavedSearch.js";
import Car from "../models/Car.js";
import { Op } from "sequelize";
// import { sendPush } from "../services/notification.service.js";

// ✅ Create Saved Search
export const createSavedSearch = async (req, res) => {
  try {
    const {
      pushToken,
      brand,
      model,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
    } = req.body;

    const userId = req.headers.userid;
    const search = await SavedSearch.create({
      userId,
      pushToken,
      brand,
      model,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
    });

    res.status(201).json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Get all searches for user
export const getUserSavedSearches = async (req, res) => {
  try {
    const { userId } = req.params;

    const searches = await SavedSearch.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete search
export const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSavedSearch = await SavedSearch.destroy({ where: { id } });

    res.json({ message: "Deleted successfully", deleteSavedSearch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔔 Toggle ON/OFF
export const toggleSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;

    const search = await SavedSearch.findByPk(id);

    if (!search) {
      return res.status(404).json({ message: "Not found" });
    }

    search.isActive = !search.isActive;
    await search.save();

    res.json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkSavedSearches = async (car) => {
  try {
    const searches = await SavedSearch.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ maxPrice: { [Op.gte]: car.price } }, { maxPrice: null }],
      },
    });

    for (const search of searches) {
      let match = true;

      if (search.brand && search.brand !== car.brand) match = false;
      if (search.model && search.model !== car.model) match = false;
      if (search.transmission && search.transmission !== car.transmission)
        match = false;
      if (search.fuelType && search.fuelType !== car.fuelType) match = false;

      if (search.minPrice && car.price < search.minPrice) match = false;
      if (search.maxPrice && car.price > search.maxPrice) match = false;

      // 🚫 Anti-spam (1 notif / day)
      if (search.lastNotifiedAt) {
        const diff = Date.now() - new Date(search.lastNotifiedAt).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < oneDay) continue;
      }

      if (match) {
        await sendPush(search.pushToken, car);

        search.lastNotifiedAt = new Date();
        await search.save();
      }
    }
  } catch (error) {
    console.error("Error checking saved searches:", error.message);
  }
};
