import sequelize from '../src/config/database.js';

beforeAll(async () => {
    await sequelize.authenticate();
});
afterAll(async () => {
    await sequelize.close();
});
test('DB connection works', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
});
