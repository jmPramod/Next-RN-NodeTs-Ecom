import { Request, Response, NextFunction } from "express";
import { Auth } from "../models/user.models";
import ProductModel from "../models/product.models";
import orderModels from "../models/order.models";
import reviewModel from "../models/review.models";
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
    const order = await orderModels
      .find({ clerkId: req.user?.clerkID })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

const orderIDs= order.map((order)=>order._id)
const reviews=await reviewModel.find({orderId:{$in:orderIDs}})
const reviewOrderId=new Set(reviews.map((review)=>review.orderID.toString()))


    //check if each order is revieved
    const orderToreview = await Promise.all(
      order.map(async (order) => {
          return {
          ...order.toObject(),
          hasReview:reviewOrderId.has(order._id.toString())// isReview ? true : false,
        };
      }),
    );

    res.status(201).json({
      message: "Orders retrieved successfully",
      product: {order: orderToreview },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};
