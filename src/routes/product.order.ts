import express from "express";
import { getProductController } from "../controllers/admin.controllers";
import { protectedRoutes } from "../middlewears/auth.middlewears";
import { getProductByIdController } from "../controllers/product.controller";

export const productRoutes=express.Router()

productRoutes.get("/products",protectedRoutes,getProductController)
productRoutes.get("/products/:id",protectedRoutes,getProductByIdController)