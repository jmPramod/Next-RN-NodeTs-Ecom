import request from "supertest";
import express from "express";
import { adminRoutes } from "../routes/admin.routes";
import ProductModel from "../models/product.models";
// import { adminRoutes } from "../routes/admin.routes";
// import ProductModel from "../models/product.models";

// 🔥 Mock middlewares (so auth doesn't block test)
jest.mock("../middlewears/auth.middlewears", () => ({
  protectedRoutes: (_req: any, _res: any, next: any) => next(),
  adminOnly: (_req: any, _res: any, next: any) => next(),
}));

// 🔥 Mock Product model
jest.mock("../models/product.models", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use("/api", adminRoutes);

describe("Admin Routes Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1 → GET PRODUCTS
  it("GET /api/products → should return products", async () => {
    (ProductModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([
        { name: "Test Product" },
      ]),
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.product.length).toBe(1);
  });

  // ✅ TEST 2 → PATCH product not found
  it("PATCH /api/products/:id → should return 404 if not found", async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/products/123")
      .send({ name: "Updated" });

    expect(res.status).toBe(404);
  });
});