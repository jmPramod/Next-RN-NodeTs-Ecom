import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom.error";
import ProductModel from "../models/product.models";
import { cloudinary } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import orderModels from "../models/order.models";
import userModels from "../models/user.models";

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name) return next(new CustomError("Name is required", 400));
    if (!description)
      return next(new CustomError("Description is required", 400));
    if (!price) return next(new CustomError("Price is required", 400));
    if (!stock) return next(new CustomError("Stock is required", 400));
    if (!category) return next(new CustomError("Category is required", 400));

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return next(new CustomError("At least one image is required", 400));
    }

    const files = req.files as Express.Multer.File[];

    if (files.length > 5) {
      return next(new CustomError("Maximum 5 images are allowed", 400));
    }

    const uploadPromises: Promise<UploadApiResponse>[] = files.map(
      (file: Express.Multer.File) =>
        cloudinary.uploader.upload(file.path, {
          folder: "products",
        })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls: string[] = uploadResults.map(
      (result: UploadApiResponse) => result.secure_url
    );

    const newProduct = await ProductModel.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      images: imageUrls,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const product = await ProductModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Product Fetched successfully",
      product: product,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    // 1️⃣ Find product
    const product = await ProductModel.findById(id);
    if (!product) {
      return next(new CustomError("Product not found", 404));
    }

    // 2️⃣ Update basic fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category) product.category = category;

    // 3️⃣ Handle images
    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > 0) {
      if (files.length > 3) {
        return next(new CustomError("Maximum 3 images are allowed", 400));
      }

      // 4️⃣ Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          await cloudinary.uploader.destroy(img.PublicId);
        }
      }

      // 5️⃣ Upload new images
      const uploadPromises: Promise<UploadApiResponse>[] = files.map(
        (file: Express.Multer.File) =>
          cloudinary.uploader.upload(file.path, {
            folder: "products",
          })
      );

      const uploadResults = await Promise.all(uploadPromises);

      // 6️⃣ Map to schema format
      product.images = uploadResults.map((result) => ({
        ImageUrl: result.secure_url,
        PublicId: result.public_id,
      }));
    }

    // 7️⃣ Save product
    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await orderModels
      .find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

export const updateIdStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!["prnding", "shipped", "delivered"].includes(status)) {
      return next(new CustomError("Invalid status", 400));
    }

    const order = await orderModels.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    const updateoreder = await order.save();
    res.status(200).json({
      message: "Order updated successfully",
      product: updateoreder,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await userModels.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Fetch all user",
      product: customer,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalOrder = orderModels.countDocuments();
    const revinueResult = await orderModels.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revinueResult[0]?.total || 0;
    const totalCustomer = await userModels.countDocuments();
    const totalProduct = await ProductModel.countDocuments();

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      result: {
        totalCustomer,
        totalOrder,
        totalProduct,
        totalRevenue,
      },
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
