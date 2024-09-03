import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { Op } from "sequelize";

jest.mock("../models/ProductModel.js");
jest.mock("../models/UserModel.js");

describe("Product Controller", () => {

  describe("getProducts", () => {
    it("should return all products if user is admin", async () => {
      const req = { role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const products = [{ uuid: "123", name: "Product 1", price: 100 }];
      Product.findAll.mockResolvedValue(products);

      await getProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({
        attributes: ['uuid', 'name', 'price'],
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(products);
    });

    it("should return user's products if user is not admin", async () => {
      const req = { role: "user", userId: "user-123" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const products = [{ uuid: "123", name: "Product 1", price: 100 }];
      Product.findAll.mockResolvedValue(products);

      await getProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({
        attributes: ['uuid', 'name', 'price'],
        where: { userId: req.userId },
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(products);
    });

    it("should return 500 if an error occurs", async () => {
      const req = { role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      Product.findAll.mockRejectedValue(error);

      await getProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("getProductById", () => {
    it("should return product by id if user is admin", async () => {
      const req = { params: { id: "product-123" }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const product = { id: 1, uuid: "product-123", name: "Product 1", price: 100 };
      Product.findOne.mockResolvedValue(product);

      await getProductById(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { uuid: req.params.id }
      });
      expect(Product.findOne).toHaveBeenCalledWith({
        attributes: ['uuid', 'name', 'price'],
        where: { id: product.id },
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "product-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findOne.mockResolvedValue(null);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "Data not found" });
    });

    it("should return 500 if an error occurs", async () => {
      const req = { params: { id: "product-123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      Product.findOne.mockRejectedValue(error);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      const req = { body: { name: "Product 1", price: 100 }, userId: "user-123" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith({
        name: req.body.name,
        price: req.body.price,
        userId: req.userId
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ msg: "Product Created Successfully" });
    });

    it("should return 500 if an error occurs", async () => {
      const req = { body: { name: "Product 1", price: 100 }, userId: "user-123" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      Product.create.mockRejectedValue(error);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully if user is admin", async () => {
      const req = { params: { id: "product-123" }, body: { name: "Updated Product", price: 150 }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const product = { id: 1, uuid: "product-123", userId: "user-123" };
      Product.findOne.mockResolvedValue(product);

      await updateProduct(req, res);

      expect(Product.update).toHaveBeenCalledWith(
        { name: req.body.name, price: req.body.price },
        { where: { id: product.id } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "Product updated successfully" });
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "product-123" }, body: { name: "Updated Product", price: 150 }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findOne.mockResolvedValue(null);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "Data not found" });
    });

    it("should return 403 if user is not admin and trying to update another user's product", async () => {
      const req = { params: { id: "product-123" }, body: { name: "Updated Product", price: 150 }, role: "user", userId: "user-456" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const product = { id: 1, uuid: "product-123", userId: "user-123" };
      Product.findOne.mockResolvedValue(product);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: "Access Denied" });
    });

    it("should return 500 if an error occurs", async () => {
      const req = { params: { id: "product-123" }, body: { name: "Updated Product", price: 150 }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      Product.findOne.mockRejectedValue(error);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully if user is admin", async () => {
      const req = { params: { id: "product-123" }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const product = { id: 1, uuid: "product-123", userId: "user-123" };
      Product.findOne.mockResolvedValue(product);

      await deleteProduct(req, res);

      expect(Product.destroy).toHaveBeenCalledWith({ where: { id: product.id } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "Product deleted successfully" });
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "product-123" }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Product.findOne.mockResolvedValue(null);

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "Data not found" });
    });

    it("should return 403 if user is not admin and trying to delete another user's product", async () => {
      const req = { params: { id: "product-123" }, role: "user", userId: "user-456" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const product = { id: 1, uuid: "product-123", userId: "user-123" };
      Product.findOne.mockResolvedValue(product);

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: "Access Denied" });
    });

    it("should return 500 if an error occurs", async () => {
      const req = { params: { id: "product-123" }, role: "admin" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error("Something went wrong");
      Product.findOne.mockRejectedValue(error);

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

});
