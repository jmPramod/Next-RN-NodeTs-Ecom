import express from "express";
import { createReviewController, deleteReviewController } from "../controllers/review.controller";

export const reviewRoutes=express.Router()

reviewRoutes.post("/reviews", createReviewController)

reviewRoutes.delete("/reviewId", deleteReviewController)
