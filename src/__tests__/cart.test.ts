import request from "supertest";
// import app from "../app";
import cartModels from "../models/cart.models";
import ProductModel from "../models/product.models";
import { app } from "../server";

// 🔥 Mock models
jest.mock("../models/cart.models");
jest.mock("../models/product.models");

// 🔥 Inject fake logged-in user
jest.mock("../middlewears/auth.middlewears", () => ({
  protectedRoutes: (req: any, _res: any, next: any) => {
    req.user = {
      clerkID: "clerk123",
      _id: "user123",
    };
    next();
  },
}));

describe("Cart Routes Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ GET CART (cart exists)
  it("GET /api/cart → should return cart", async () => {
    (cartModels.findOne as jest.Mock).mockResolvedValue({
      items: [],
      populate: jest.fn().mockReturnThis(),
    });

    const res = await request(app).get("/api/cart");

    expect(res.status).toBe(200);
  });

  // ✅ CREATE CART ITEM - product not found
  it("POST /api/cart → should return 404 if product not found", async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post("/api/cart").send({
      productId: "prod123",
      quantity: 1,
    });

    expect(res.status).toBe(404);
  });

  // ✅ CREATE CART ITEM SUCCESS
  it("POST /api/cart → should add item to cart", async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue({
      stock: 10,
    });

    (cartModels.findOne as jest.Mock).mockResolvedValue({
      items: [],
      save: jest.fn(),
    });

    const res = await request(app).post("/api/cart").send({
      productId: "prod123",
      quantity: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item added to cart successfully");
  });

  // ✅ UPDATE CART ITEM - invalid quantity
  it("PATCH /api/cart/:productId → quantity < 1", async () => {
    const res = await request(app)
      .patch("/api/cart/prod123")
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
  });

  // ✅ CLEAR CART
  it("DELETE /api/cart → should clear cart", async () => {
    (cartModels.findOne as jest.Mock).mockResolvedValue({
      items: [{ product: "prod1", quantity: 1 }],
      save: jest.fn(),
    });

    const res = await request(app).delete("/api/cart");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Cart cleared successfully");
  });
});