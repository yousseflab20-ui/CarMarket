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
