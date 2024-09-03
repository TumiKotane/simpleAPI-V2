import User from "../models/UserModel.js";
import argon2 from "argon2";
import { Login, Me, logOut } from "../controllers/authController.js";

jest.mock("../models/UserModel.js");
jest.mock("argon2");

describe("Auth Controller", () => {
  describe("Login", () => {
    it("should return 404 if user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      
      const req = { body: { email: "test@example.com", password: "password123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "user not found" });
    });

    it("should return 400 if password does not match", async () => {
      const user = { password: "hashedpassword" };
      User.findOne.mockResolvedValue(user);
      argon2.verify.mockResolvedValue(false);
      
      const req = { body: { email: "test@example.com", password: "wrongpassword" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Wrong Password" });
    });

    it("should return 200 and user details if login is successful", async () => {
      const user = { uuid: "123", name: "John Doe", email: "test@example.com", role: "user", password: "hashedpassword" };
      User.findOne.mockResolvedValue(user);
      argon2.verify.mockResolvedValue(true);
      
      const req = { body: { email: "test@example.com", password: "password123" }, session: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Login(req, res);

      expect(req.session.userId).toBe(user.uuid);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role
      });
    });
  });

  describe("Me", () => {
    it("should return 401 if user is not logged in", async () => {
      const req = { session: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: "Please log in to your account!" });
    });

    it("should return 404 if user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      
      const req = { session: { userId: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Me(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "User not found" });
    });

    it("should return 200 and user details if user is found", async () => {
      const user = { uuid: "123", name: "John Doe", email: "test@example.com", role: "user" };
      User.findOne.mockResolvedValue(user);
      
      const req = { session: { userId: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await Me(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  describe("logOut", () => {
    it("should return 400 if unable to logout", () => {
      const req = { session: { destroy: jest.fn((callback) => callback(new Error("Logout error"))) } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      logOut(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Unable to logout" });
    });

    it("should return 200 if logout is successful", () => {
      const req = { session: { destroy: jest.fn((callback) => callback(null)) } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      logOut(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "You have successfully logged out" });
    });
  });
});
