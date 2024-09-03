import User from "../models/UserModel.js";
import argon2 from "argon2";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js";

jest.mock("../models/UserModel.js");
jest.mock("argon2");

describe("User Controller", () => {

  describe("getUsers", () => {
    it("should return all users", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const users = [{ uuid: "123", name: "John Doe", email: "john@example.com", role: "user" }];
      User.findAll.mockResolvedValue(users);

      await getUsers(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        attributes: ['uuid', 'name', 'email', 'role']
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it("should return 500 if an error occurs", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      User.findAll.mockRejectedValue(error);

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = { uuid: "user-123", name: "John Doe", email: "john@example.com", role: "user" };
      User.findOne.mockResolvedValue(user);

      await getUserById(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        attributes: ['uuid', 'name', 'email', 'role'],
        where: { uuid: req.params.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 500 if an error occurs", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      User.findOne.mockRejectedValue(error);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          confPassword: "password123",
          role: "user"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      argon2.hash.mockResolvedValue("hashedPassword");

      await createUser(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: req.body.name,
        email: req.body.email,
        password: "hashedPassword",
        role: req.body.role
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ msg: "Registered Successfully" });
    });

    it("should return 400 if passwords do not match", async () => {
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          confPassword: "password124",
          role: "user"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Password and Confirm Password do not match" });
    });

    it("should return 400 if an error occurs", async () => {
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          confPassword: "password123",
          role: "user"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      argon2.hash.mockRejectedValue(error);

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const req = {
        params: { id: "user-123" },
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "newpassword123",
          confPassword: "newpassword123",
          role: "admin"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = { id: 1, uuid: "user-123", password: "oldpassword" };
      User.findOne.mockResolvedValue(user);
      argon2.hash.mockResolvedValue("hashedNewPassword");

      await updateUser(req, res);

      expect(User.update).toHaveBeenCalledWith({
        name: req.body.name,
        email: req.body.email,
        password: "hashedNewPassword",
        role: req.body.role
      }, {
        where: { id: user.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "User Updated" });
    });

    it("should return 404 if user not found", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "User not found" });
    });

    it("should return 400 if passwords do not match", async () => {
      const req = {
        params: { id: "user-123" },
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "newpassword123",
          confPassword: "differentpassword123",
          role: "admin"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = { id: 1, uuid: "user-123", password: "oldpassword" };
      User.findOne.mockResolvedValue(user);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Password and Confirm Password do not match" });
    });

    it("should return 400 if an error occurs", async () => {
      const req = {
        params: { id: "user-123" },
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "newpassword123",
          confPassword: "newpassword123",
          role: "admin"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      User.findOne.mockRejectedValue(error);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = { id: 1, uuid: "user-123" };
      User.findOne.mockResolvedValue(user);

      await deleteUser(req, res);

      expect(User.destroy).toHaveBeenCalledWith({
        where: { id: user.id }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "User Deleted" });
    });

    it("should return 404 if user not found", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "User not found" });
    });

    it("should return 400 if an error occurs", async () => {
      const req = { params: { id: "user-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      User.findOne.mockRejectedValue(error);

      await deleteUser(req, res); // call the deleteUser function

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

});
