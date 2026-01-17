import { requireAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import userModels from "../models/user.models";

export const protectedRoutes = [
  requireAuth(),
  async (req: any | Request, res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth().userId;
      if (!clerkUserId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - token invalid" });
      }
      const user = await userModels.findOne({ clerkID: clerkUserId });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - user not found" });
      }

      req.user = user;
      next()
    } catch (error) {
      console.log("error1:", error);

      next(error);
    }
  },
];

export const adminOnly = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - user not found " });
    }

    if (req.user.email != process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: "Unauthorized - admin only" });
    }
    next();
  } catch (error) {
    next(error)
  }
};
