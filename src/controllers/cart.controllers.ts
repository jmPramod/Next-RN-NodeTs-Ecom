// import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../models/user.models";
import cartModels from "../models/cart.models";
import ProductModel from "../models/product.models";

export interface AuthRequest extends Request {
  user?: Auth;
}

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartModels
      .findOne({ clerkId: req.user?.clerkID })
      .populate("items.product");

    if (!cart) {
      const user = req.user;
      const newCart = await cartModels.create({
        clerkId: user?.clerkID,
        user: user?._id,
        items: [],
      });

      return res.status(200).json({
        message: "Cart Fetched successfully",
        cart: newCart,
        statusCode: 200,
      });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      cart: cart,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
export const createCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, quantity = 1 } = req.body;

    //check product exist and stock exist

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        statusCode: 404,
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        statusCode: 400,
      });
    }

    let cart = await cartModels.findOne({ clerkId: req.user?.clerkID });

    if (!cart) {
      const user = req.user;
      cart = await cartModels.create({
        clerkId: user?.clerkID,
        user: user?._id,
        items: [],
      });
    }
    //check if item is in the cart

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + 1;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          statusCode: 400,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();

    res.status(200).json({
      message: "Item added to cart successfully",
      cart: cart,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
const { productId } = req.params;
const cart = await cartModels.findOne({ clerkId: req.user?.clerkID });
if (!cart) {
  return res.status(404).json({
    message: "Cart not found",
    statusCode: 404,});
    }
const itemIndex = cart.items.filter(
    (item) => item.product.toString() !== productId,
    );
    await cart.save();




    res.status(200).json({
      message: "Item deleted from cart successfully",
      cart: cart,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
        statusCode: 400,
      });
    }
    const cart = await cartModels.findOne({ clerkId: req.user?.clerkID });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        statusCode: 404,
      });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
        statusCode: 404,    
      });
    }

    // check if product exist
const product = await ProductModel.findById(productId);
if (!product) {
  return res.status(404).json({
    message: "Product not found",
    statusCode: 404,
  });
}

if (product.stock < quantity) {
  return res.status(400).json({
    message: "Insufficient stock",
    statusCode: 400,
  });
}

cart.items[itemIndex].quantity = quantity;

await cart.save();

    res.status(201).json({
      message: "Cart updated successfully",
      cart: cart,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
const { productId } = req.params;
const cart = await cartModels.findOne({ clerkId: req.user?.clerkID });
if (!cart) {
  return res.status(404).json({
    message: "Cart not found",
    statusCode: 404,});
    }
 cart.items = [];
    await cart.save();




    res.status(200).json({
      message: "Cart cleared successfully",
      cart: cart,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
