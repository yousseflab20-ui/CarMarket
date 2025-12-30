import { sequelize } from '../src/config/database.js';

test('DB connection works', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
});
