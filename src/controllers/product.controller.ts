import { NextFunction,Request,Response } from "express-serve-static-core";
import { Auth } from "../models/user.models";
import ProductModel from "../models/product.models";

interface AuthRequest extends Request {
  user?: Auth;
}

export const getProductByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const {id}=req.params
    const product= await ProductModel.findById(id)
if(!product){
    return res.status(404).json({
        message: "Product not found",
        statusCode: 404,
      });
}
    
    
    
    
    res.status(200).json({
        message: "Product fetched successfully",
        product: product,
        statusCode: 200,
      });
    
  } catch (error) {
    next(error);
  }
};
