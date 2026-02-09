import { Request, Response, NextFunction } from "express";
import { Auth } from "../models/user.models";
import ProductModel from "../models/product.models";
import orderModels from "../models/order.models";
export interface AuthRequest extends Request {
  user?: Auth;
}

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items",
        statusCode: 400,
      });
    }

    //validte product and stock
    for (const item of orderItems) {
      const product = await ProductModel.findById(item.product._id);
      if (!product) {
        return res.status(400).json({
          message: "Product not found",
          statusCode: 400,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}`,
          statusCode: 400,
        });
      }
    }

    const order = await orderModels.create({
      user: user?._id,
      clerkId: user?.clerkID,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    //update product stock
    for (const item of orderItems) {
      const product = await ProductModel.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { stock: -item.quantity },
        },
        { new: true },
      );
    }
    res.status(201).json({
      message: "Order created successfully",
      order: order,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};
export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isDefault, country, state, city, pinCode, landmark, addressLine } =
      req.body;
    const user = req.user;
    if (user) {
      if (!isDefault) {
        user.address.forEach((add) => {
          add.isDefault = false;
        });
      }
      user.address.push({
        isDefault: isDefault || false,
        country,
        state,
        city,
        pinCode,
        landmark,
        addressLine,
      });

      const addAdrs = await user.save();

      res.status(201).json({
        message: "Address Added successfully",
        product: addAdrs,
        statusCode: 201,
      });
    }
  } catch (error) {
    next(error);
  }
};
