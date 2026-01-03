import { register } from "../src/controllers/auth.Controller";
import { user } from "../src/models";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Register Controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: { email: "y@example.com", password: "123456", name: "Youssef", photo: "pic.jpg" }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        user.findOne = jest.fn().mockResolvedValue(null);
        user.create = jest.fn().mockResolvedValue({ id: 1, email: "y@example.com", role: "user" });
        // @ts-ignore
        jwt.sign.mockReturnValue("fake-token");
    });

    it("should register user successfully", async () => {
        await register(req, res);

        expect(user.findOne).toHaveBeenCalledWith({ where: { email: "y@example.com" } });
        expect(user.create).toHaveBeenCalledWith({ email: "y@example.com", password: "123456", name: "Youssef", photo: "pic.jpg" });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully", token: "fake-token" });
    });
});
