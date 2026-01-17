import mongoose from "mongoose";

interface cartSchemaProps extends mongoose.Document{
user:mongoose.Schema.Types.ObjectId
clerkId:String
items:cartItemSchemaProps[]
}

interface cartItemSchemaProps{
    product:mongoose.Schema.Types.ObjectId;
    quantity:number;
}

const cartItemSchema=new mongoose.Schema<cartItemSchemaProps>({
    product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
    quantity:{type:Number,required:true,min:1,default:1},

})
const cartSchema= new mongoose.Schema<cartSchemaProps>({
user:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
clerkId:{type:String,required:true,unique:true},
items:[cartItemSchema],
},{timestamps:true});


const cartModels=mongoose.model<cartSchemaProps>('cart',cartSchema)

export default cartModels;