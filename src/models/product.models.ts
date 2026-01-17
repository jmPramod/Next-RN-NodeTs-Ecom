import mongoose from "mongoose";

export interface ProductSchemaProps extends mongoose.Document{
    name:string;
    description:string;
    price:number;
    stock:number;
    category:string;
    images:{ImageUrl:string,PublicId:string}[];
    averageRating:number;
    totalRevinue:number;
} 

const productSchema=new mongoose.Schema<ProductSchemaProps>({
name:{type:String,required:true},
description:{type:String,required:true},
price:{type:Number,required:true,min:0},
stock:{type:Number,required:true},
category:{type:String,required:true},
images:[{type:{ImageUrl:String,PublicId:String},required:true}],
averageRating:{type:Number,default:0,min:0,max:5},
totalRevinue:{type:Number,default:0,min:0},
},{
    timestamps:true
})

const ProductModel=mongoose.model<ProductSchemaProps>("Product",productSchema);

export default ProductModel;