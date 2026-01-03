import sequelize from '../src/config/database.js';
/** @type {import('../src/models/User.js').default} */
import user from "../src/models/User.js"
import car from '../src/models/Car.js';
import favorite from '../src/models/Favorite.js';
beforeAll(async () => {
    await sequelize.authenticate();
});

afterAll(async () => {
    await sequelize.close();
});

test('DB connection works', async () => {
    expect(true).toBe(true);
});

test("User model is defined", () => {
    expect(user).toBeDefined();
});

test("User model has correct fields", () => {
    const attrs = user.rawAttributes;

    expect(attrs).toHaveProperty('id');
    expect(attrs).toHaveProperty('name');
    expect(attrs).toHaveProperty('email');
    expect(attrs).toHaveProperty('password');
    expect(attrs).toHaveProperty("photo");
});

test("car is check", async () => {
    expect(car).toBeDefined();
})

test("table is valide", () => {
    const Car = car.rawAttributes
    expect(Car).toHaveProperty("title")
    expect(Car).toHaveProperty("brand")
    expect(Car).toHaveProperty("model")
    expect(Car).toHaveProperty("year")
    expect(Car).toHaveProperty("mileage")
    expect(Car).toHaveProperty("description")
    expect(Car).toHaveProperty("userId")
})

test("favorite is check", async () => {
    expect(favorite).toBeDefined()
})

test("favorite is valide", async () => {
    const Favorite = favorite.rawAttributes
    expect(Favorite).toHaveProperty("userId")
    expect(Favorite).toHaveProperty("carId")
})