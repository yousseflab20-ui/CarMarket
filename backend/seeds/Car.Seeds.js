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
        price: 15000,
        mileage: 30000,
        description: "Reliable sedan with low mileage",
        photo:
          "https://i.pinimg.com/736x/98/c1/24/98c124d606c8c266b17c549ca6ab86b3.jpg",
        userId: 1,
      },
      {
        title: "Honda Civic",
        brand: "Honda",
        model: "Civic",
        year: 2019,
        price: 14000,
        mileage: 40000,
        description: "Sporty compact car, very efficient",
        photo:
          "https://i.pinimg.com/736x/f7/81/fb/f781fbc4e4c1b64f0afb0ec8b0bd48d9.jpg",
        userId: 1,
      },
      {
        title: "Ford F-150",
        brand: "Ford",
        model: "F-150",
        year: 2021,
        price: 35000,
        mileage: 15000,
        description: "Powerful truck for all your needs",
        photo:
          "https://i.pinimg.com/736x/03/5d/13/035d1370cef0f448bd0d6034f8a785f6.jpg",
        userId: 1,
      },
      {
        title: "BMW X5",
        brand: "BMW",
        model: "X5",
        year: 2022,
        price: 60000,
        mileage: 5000,
        description: "Luxury SUV with high performance",
        photo:
          "https://i.pinimg.com/1200x/e3/64/78/e36478992b8924b021d0e36a25500ff4.jpg",
        userId: 1,
      },
      {
        title: "Mercedes C-Class",
        brand: "Mercedes",
        model: "C-Class",
        year: 2021,
        price: 45000,
        mileage: 12000,
        description: "Comfortable sedan with premium features",
        photo:
          "https://i.pinimg.com/736x/4a/fe/b7/4afeb78d9c5c80ed07ae35f54ed813b8.jpg",
        userId: 1,
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
