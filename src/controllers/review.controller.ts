import { NextFunction, Request, Response } from "express-serve-static-core";
import { Auth } from "../models/user.models";
import ProductModel from "../models/product.models";
import orderModels from "../models/order.models";
import reviewModel from "../models/review.models";

interface AuthRequest extends Request {
  user?: Auth;
}

export const createReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, OrderId, rating } = req.body;
    const user = req.user;
    if (rating < 1 || rating > 5 || !rating) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
        statusCode: 400,
      });
    }
    const order = await orderModels.findById(OrderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        statusCode: 404,
      });
    }
    if (user?.clerkID == order.clerkId) {
      return res.status(403).json({
        message: "You cannot review your own order",
        statusCode: 403,
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "You can only review delivered orders",
        statusCode: 400,
      });
    }

    //verify if product is in order
    const isProductInOrder = order.orderItems.some(
      (product) => product.product.toString() === productId.toString(),
    );
    if (!isProductInOrder) {
      return res.status(400).json({
        message: "Product not found in order",
        statusCode: 400,
      });
    }
    //check if user has already reviewed the product
    const hasReviewed = await reviewModel.findOne({
      productID: productId,
      userID: user?._id,
    });
    if (hasReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product",

        statusCode: 400,
      });
    }

    const review = await reviewModel.create({
      productID: productId,
      userID: user?._id,
      orderID: OrderId,
      rating: rating,
    });
    //update product rating
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        statusCode: 404,
      });
    }

    const reviews = await reviewModel.find({ productID: productId });
    const totleRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const updateProduct = await ProductModel.findByIdAndUpdate(
      productId,
      {
        averageRating: totleRating / reviews.length,
        totalReview: reviews.length,
      },
      {
        new: true,
      },
    );
    if (!updateProduct) {
      await reviewModel.findByIdAndDelete(review._id);
      return res.status(500).json({
        message: "Failed to update product rating",
        statusCode: 500,
      });
    }

    product.averageRating = totleRating / reviews.length;
    product.totalReview = reviews.length;

    await product.save();
    res.status(200).json({
      message: "Product fetched successfully",
      product: product,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;
    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        statusCode: 404,
      });
    }

    if (review.userID.toString() !== user?._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own review",
        statusCode: 403,
      });
    }
    const productId = review.productId;
    await reviewModel.findByIdAndDelete(reviewId);

    const reviews = await reviewModel.find({ productID: productId });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReview: reviews.length,
    });

    res.status(200).json({
      message: "Review deleted successfully",
      product: null,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
