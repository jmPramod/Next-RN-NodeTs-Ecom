import { Request, Response, NextFunction } from "express";
import { Auth } from "../models/user.models";
import { CustomError } from "../utils/custom.error";

interface AuthRequest extends Request {
  user?: Auth;
}

export const addAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
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

export const getAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
       const user = req.user;
    

    res.status(200).json({
      message: "all Address fetched",
      product: user?.address,
      statusCode: 201,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

 const {name, isDefault, country, state, city, pinCode, landmark, addressLine } =
      req.body;
    const { addressId } = req.params;
    const user = req.user;
    const address = user?.address.id(addressId);
    if (!address) {
      return next(new CustomError("address not found ", 404));
    }
     if (!isDefault&&user) {
        user.address.forEach((add) => {
          add.isDefault = false;
        });
      }

      address.name=name||address.name
      
      address.country=country||address.country
      address.state=state||address.state
      address.city=city||address.city
      address.pinCode=pinCode||address.pinCode
address.addressLine=addressLine||address.addressLine
      
      address.landmark=landmark||address.landmark

    return;
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try { 

    const user=req.user
    const {addressId}=req.params

user?.address.pull(addressId) 
await user?.save()
   res.status(201).json({
      message: "Address Deleted successfully",
      user: user,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const addwishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
 const {productId}=req.body
const user=req.user
    if(user?.wishlist.includes(productId)){
           return next(new CustomError("Product already in wishlist", 400));
    }
    user?.wishlist.push(productId)
    await user?.save()
       res.status(201).json({
      message: "Product Added to wishlist successfully",
      wishlist: user?.wishlist,
      statusCode: 201,
    });
   
  } catch (error) {
    next(error);
  }
};

export const getwishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // return;

const user=req.user

res.status(200).json({
      message: "Product created successfully",
      wishlist:user?.wishlist,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const deletewishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  try {
  const {productId}=req.params
const user=req.user
   if( user?.wishlist.some(
  (id) => id.toString() === productId
)){
           return next(new CustomError("Product not in wishlist", 400));
    }
user?.wishlist.pull(productId);//remove this ID from user.address
   res.status(201).json({
      message: "Removed from wishlist",
      wishlist: user?.wishlist,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};
