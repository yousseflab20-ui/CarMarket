import car from "../src/models/Car.js";
import sequelize from "../src/config/database.js";

const seedCars = async () => {
  try {
    await sequelize.sync({ force: true });

    const carsData = [
      {
        title: "Toyota Corolla",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        speed: "100",
        seats: "5",
        pricePerDay: "200",
        price: 15000,
        mileage: 30000,
        description:
          "This Toyota Corolla is a reliable sedan that combines fuel efficiency with comfortable seating for five passengers. It features modern safety technologies, low mileage, and a smooth driving experience, making it ideal for daily commutes or long-distance trips.",
        photo:
          "https://i.pinimg.com/736x/98/c1/24/98c124d606c8c266b17c549ca6ab86b3.jpg",
        userId: 3,
      },
      {
        title: "Honda Civic",
        brand: "Honda",
        model: "Civic",
        year: 2019,
        speed: "100",
        seats: "5",
        pricePerDay: "200",
        price: 14000,
        mileage: 40000,
        description:
          "The Honda Civic is a sporty compact car that offers excellent fuel economy, responsive handling, and a sleek exterior design. Its interior provides comfort for five passengers and comes equipped with modern infotainment and safety features.",
        photo:
          "https://i.pinimg.com/736x/f7/81/fb/f781fbc4e4c1b64f0afb0ec8b0bd48d9.jpg",
        userId: 3,
      },
      {
        title: "Ford F-150",
        brand: "Ford",
        model: "F-150",
        year: 2021,
        speed: "100",
        seats: "5",
        pricePerDay: "200",
        price: 35000,
        mileage: 15000,
        description:
          "The Ford F-150 is a powerful full-size truck designed for heavy-duty performance. It offers high towing capacity, spacious seating for five, modern technology, and off-road capabilities, making it perfect for work or adventure.",
        photo:
          "https://i.pinimg.com/736x/03/5d/13/035d1370cef0f448bd0d6034f8a785f6.jpg",
        userId: 3,
      },
      {
        title: "BMW X5",
        brand: "BMW",
        model: "X5",
        year: 2022,
        speed: "100",
        seats: "5",
        pricePerDay: "200",
        price: 60000,
        mileage: 5000,
        description:
          "Luxury meets performance in the BMW X5. This high-end SUV offers a powerful engine, sophisticated interior with premium materials, advanced safety and tech features, and ample space for five passengers and luggage, perfect for both city driving and long journeys.",
        photo:
          "https://i.pinimg.com/1200x/e3/64/78/e36478992b8924b021d0e36a25500ff4.jpg",
        userId: 3,
      },
      {
        title: "Mercedes C-Class",
        brand: "Mercedes",
        model: "C-Class",
        year: 2021,
        speed: "100",
        seats: "5",
        pricePerDay: "200",
        price: 45000,
        mileage: 12000,
        description:
          "The Mercedes C-Class is a stylish and comfortable sedan that combines luxury and performance. It features premium interior materials, advanced driver-assistance systems, smooth handling, and a refined ride quality, making it ideal for those who value elegance and comfort.",
        photo:
          "https://i.pinimg.com/736x/4a/fe/b7/4afeb78d9c5c80ed07ae35f54ed813b8.jpg",
        userId: 3,
      },
    ];

    for (const carData of carsData) {
      const existingCar = await car.findOne({
        where: { title: carData.title },
      });
      if (!existingCar) {
        await car.create(carData);
        console.log(`Added car: ${carData.title}`);
      } else {
        console.log(`Car already exists: ${carData.title}`);
      }
    }

    console.log("Seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding cars:", err);
    process.exit(1);
  }
};

seedCars();
