import FAQ from "../models/FAQ.js";

export const getFAQs = async (req, res) => {
    try {
        const { lang } = req.query;
        // Default to english if lang query param is missing or unsupported
        const currentLang = ['en', 'ar', 'fr'].includes(lang) ? lang : 'en';

        const faqs = await FAQ.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });

        const formattedFaqs = faqs.map(faq => ({
            id: faq.id,
            question: faq[`question_${currentLang}`] || faq.question_en,
            answer: faq[`answer_${currentLang}`] || faq.answer_en,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt
        }));

        res.status(200).json(formattedFaqs);
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createFAQ = async (req, res) => {
    try {
        const {
            question_en, question_ar, question_fr,
            answer_en, answer_ar, answer_fr, isActive
        } = req.body;

        const newFaq = await FAQ.create({
            question_en, question_ar, question_fr,
            answer_en, answer_ar, answer_fr, isActive
        });

        res.status(201).json(newFaq);
    } catch (error) {
        console.error("Error creating FAQ:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
