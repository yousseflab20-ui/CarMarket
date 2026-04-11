import FAQ from './src/models/FAQ.js';

const seedFAQs = async () => {
  try {
    const faqs = [
      {
        question_en: "How do I list my car for sale?",
        question_ar: "كيف يمكنني عرض سيارتي للبيع؟",
        question_fr: "Comment mettre ma voiture en vente ?",
        answer_en: "It's simple! Just create an account, verify your profile to build trust, and click on 'Add Car'. Fill in your car's details, upload clear photos, and set your price to go live instantly.",
        answer_ar: "إنه بسيط! ما عليك سوى إنشاء حساب، وتوثيق ملفك الشخصي لبناء الثقة، والنقر فوق 'إضافة سيارة'. املأ تفاصيل سيارتك، وحمل صورًا واضحة، وحدد سعرك لتنشر فورًا.",
        answer_fr: "C'est simple ! Créez un compte, vérifiez votre profil pour instaurer la confiance, et cliquez sur 'Ajouter une voiture'. Remplissez les détails, téléchargez des photos claires et fixez votre prix pour être en ligne instantanément.",
        isActive: true
      },
      {
        question_en: "Is it safe to buy a car through this platform?",
        question_ar: "هل من الآمن شراء سيارة من خلال هذه المنصة؟",
        question_fr: "Est-il sûr d'acheter une voiture via cette plateforme ?",
        answer_en: "We prioritize your safety. Look for the 'Verified Seller' badge on profiles, which means we have confirmed their identity.",
        answer_ar: "نحن نعطي الأولوية لسلامتك. ابحث عن شارة 'بائع موثوق' في الملفات الشخصية، مما يعني أننا أكدنا هويتهم.",
        answer_fr: "Nous accordons la priorité à votre sécurité. Recherchez le badge 'Vendeur vérifié' sur les profils, ce qui signifie que nous avons confirmé leur identité.",
        isActive: true
      }
    ];

    for (const faqData of faqs) {
      await FAQ.create(faqData);
    }
    console.log("✅ FAQs seeded successfully");
  } catch (error) {
    console.error("❌ FAQ Seeding failed:", error);
  }
};

seedFAQs();
