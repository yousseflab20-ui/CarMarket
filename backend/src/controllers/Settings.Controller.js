import settings from "../models/Settings.js";

export const postFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Question and answer are required" });
    }
    const faq = await settings.create({ question, answer });
    return res.status(201).json({ message: "post FAQ is valid ✅", faq });
  } catch (error) {
    res.status(400).json({ message: "FAQ nout found", error });
  }
};

export const getFAQ = async (req, res) => {
  try {
    const faqs = await settings.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });
    return res.status(201).json({ message: "get FAQ is valid ✅", faqs });
  } catch (error) {
    res.status(400).json({ message: "FAQ nout found", error });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const faqs = await FAQ.update(req.body, {
      where: { id: req.params.id },
    });
    return res
      .status(201)
      .json({ message: "update FAQ is valide check your update ✅", faqs });
  } catch (error) {
    res.status(400).json({ message: "FAQ nout found", error });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    // const { id } = req.params;
    const faqs = await settings.destroy({
      where: { id: req.params.id },
    });
    return res.status(201).json({ message: "delete FAQ is valid ✅", faqs });
  } catch (error) {
    res.status(400).json({ message: "FAQ nout found for delete", error });
  }
};
