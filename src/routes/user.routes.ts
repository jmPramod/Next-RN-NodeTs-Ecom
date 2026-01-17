import express from 'express'
import { addAddress, addwishlist, deleteAddress, deletewishlist, getAddress, getwishlist, updateAddress } from '../controllers/user.controller'
import { protectedRoutes } from '../middlewears/auth.middlewears'
export const userRoutes=express.Router()

//address Routes
userRoutes.post('/address',protectedRoutes,addAddress)
userRoutes.get('/address',protectedRoutes,getAddress)
userRoutes.patch('/address/:addressId',protectedRoutes,updateAddress)
userRoutes.delete('/address/:addressId',protectedRoutes,deleteAddress )
//wishlist route
userRoutes.post('/wishlist',protectedRoutes,addwishlist)
userRoutes.get('/wishlist',protectedRoutes,getwishlist) 
userRoutes.delete('/wishlist/:wishlistId',protectedRoutes,deletewishlist )
  