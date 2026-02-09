import express from "express"
import { clearCart, createCart, deleteCartItem, getCart, updateCartItem } from "../controllers/cart.controllers"

export const cartRoutes = express.Router()


cartRoutes.get("/cart",getCart)
cartRoutes.post("/cart",createCart)
cartRoutes.delete("/cart/:productId",deleteCartItem)
cartRoutes.patch("/cart/:productId",updateCartItem)
cartRoutes.delete("/cart",clearCart)