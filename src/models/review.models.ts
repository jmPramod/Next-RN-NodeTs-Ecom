import mongoose, { mongo } from "mongoose";
export interface reviewSchemaProps extends mongoose.Document{
    productId:mongoose.Schema.Types.ObjectId;
    userID:mongoose.Schema.Types.ObjectId;
    orderID:mongoose.Schema.Types.ObjectId;
    rating:number;
    comment:string;
}

const reviewSchema=new mongoose.Schema<reviewSchemaProps>({
productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
userID:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},

orderID:{type:mongoose.Schema.Types.ObjectId,ref:"orders",required:true},
rating:{type:Number,required:true,min:1,max:5},
comment:{type:String,required:true},
},{timestamps:true})


const reviewModel=mongoose.model<reviewSchemaProps>("Review",reviewSchema);
export default reviewModel;