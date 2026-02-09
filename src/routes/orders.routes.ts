import express  from 'express';
import { protectedRoutes } from '../middlewears/auth.middlewears';
import { createOrder, getUserOrders } from '../controllers/order.controller';
export const orderRoutes=express.Router()

orderRoutes.post('/',protectedRoutes,createOrder)

orderRoutes.get('/',protectedRoutes,getUserOrders)