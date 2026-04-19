import SavedSearch from "../models/SavedSearch.js";
import Car from "../models/Car.js";
import { Op } from "sequelize";
import NotificationService from "../services/notification.Service.js";

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
      city,
      year,
      search: searchQuery,
    } = req.body;

    const userId = req.user.id;

    if (!pushToken) {
      return res.status(400).json({ error: "Push token is required for saved searches" });
    }

    const search = await SavedSearch.create({
      userId,
      pushToken,
      brand,
      model,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      city,
      year,
      search: searchQuery,
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

    console.log(`🔎 Found ${searches.length} active saved searches to check.`);

    for (const search of searches) {
      // 🚫 Skip if the searcher is the seller themselves
      if (search.userId === car.userId) {
        console.log(`⏭️ Skipping search ID ${search.id} because it belongs to the car seller.`);
        continue;
      }

      let matches = [];

      // Check each criteria individually (OR logic)
      if (search.brand && search.brand.toLowerCase() === car.brand.toLowerCase()) matches.push("Brand");
      if (search.model && search.model.toLowerCase() === car.model.toLowerCase()) matches.push("Model");
      if (search.transmission && search.transmission?.toLowerCase() === car.transmission?.toLowerCase()) matches.push("Transmission");
      if (search.fuelType && search.fuelType?.toLowerCase() === car.fuelType?.toLowerCase()) matches.push("Fuel");
      if (search.city && search.city.toLowerCase() === car.city.toLowerCase()) matches.push("City");

      // Special check for price (within range)
      if (search.minPrice || search.maxPrice) {
        let priceInRange = true;
        if (search.minPrice && car.price < search.minPrice) priceInRange = false;
        if (search.maxPrice && car.price > search.maxPrice) priceInRange = false;
        if (priceInRange) matches.push("Price");
      }

      if (matches.length === 0) {
        console.log(`❌ Search ID ${search.id} did not match any of the criteria.`);
        continue;
      }

      // 🚫 Anti-spam (1 notif / day per search)
      if (search.lastNotifiedAt) {
        const diff = Date.now() - new Date(search.lastNotifiedAt).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        if (diff < oneDay) {
          console.log(`⏳ Search ID ${search.id} matched via [${matches.join(", ")}] but was already notified in the last 24h.`);
          continue;
        }
      }

      console.log(`🔔 Match found via: ${matches.join(", ")}! Sending notification for Search ID ${search.id}`);

      await NotificationService.notifyUser({
        userId: search.userId,
        fcmToken: search.pushToken, // Use the token saved with the search
        title: "New Car Found! 🚗",
        body: `A new ${car.brand} ${car.model} is available in ${car.city} for $${car.price}.`,
        data: { 
          type: "SAVED_SEARCH_MATCH", 
          carId: car.id.toString(),
          brand: car.brand,
          model: car.model,
          city: car.city
        },
      });

      search.lastNotifiedAt = new Date();
      await search.save();
    }
  } catch (error) {
    console.error("Error checking saved searches:", error.message);
  }
};
