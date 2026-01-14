import { Order, car as Car, user as User } from "../models/index.js";

export const createOrder = async (req, res) => {
  try {
    const { carId, message } = req.body;
    const buyerId = req.user.id;

    const car = await Car.findByPk(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const order = await Order.create({
      carId,
      buyerId,
      // @ts-ignore
      sellerId: car.userId,
      message,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Order.findAll({
      where: { sellerId },
      include: [
        {
          model: Car,
          as: "car",
          attributes: ["id", "title", "photo", "price"],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.findAll({
      where: { buyerId },
      include: [
        {
          model: Car,
          as: "car",
          attributes: ["id", "title", "photo", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // @ts-ignore
    order.status = "accepted";
    await order.save();

    await Car.update(
      { status: "sold" },
      // @ts-ignore
      { where: { id: order.carId } }
    );

    res.json({ message: "Order accepted", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // @ts-ignore
    order.status = "rejected";
    await order.save();

    res.json({ message: "Order rejected", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
