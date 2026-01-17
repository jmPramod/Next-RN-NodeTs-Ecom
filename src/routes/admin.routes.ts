import express from "express";
import {
  createProductController,
  getAllCustomer,
  getAllOrders,
  getDashboardStats,
  getProductController,
  updateIdStatus,
  updateProductController,
} from "../controllers/admin.controllers";
import { adminOnly, protectedRoutes } from "../middlewears/auth.middlewears";
import { upload } from "../middlewears/multer.middlewear";

export const adminRoutes = express.Router();
adminRoutes.use(protectedRoutes, adminOnly);
adminRoutes.post("/products", upload.array("images", 5), createProductController);

adminRoutes.get("/products", getProductController);

adminRoutes.patch("/products/:id", upload.array("images", 5),updateProductController);


adminRoutes.get('/orders',getAllOrders)
adminRoutes.patch('/orders/:orderId/status',updateIdStatus)


adminRoutes.get("/customer",getAllCustomer)

adminRoutes.get('/stats',getDashboardStats)