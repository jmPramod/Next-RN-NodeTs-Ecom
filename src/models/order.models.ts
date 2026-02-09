import mongoose from "mongoose";

interface orderItemSchemaProps extends mongoose.Document{
    product:mongoose.Schema.Types.ObjectId;
    name:string;
    price:number;
    quantity:number;
    image:string;
}
const orderItemSchema=new mongoose.Schema<orderItemSchemaProps>({
    product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
    name:{type:String, },
    price:{type:Number,required:true,min:0},
    quantity:{type:Number,required:true,min:1,default:1},
    image:{type:String,required:true},
})

interface shippingAddressSchemaProps extends mongoose.Document{
      fullName: string; 
    country: string;
    state:string;
    city:string;
    pinCode: number
    landmark: string;
    addressLine:string;
}
const shippingAddressSchema= new mongoose.Schema<shippingAddressSchemaProps>({
    fullName:{type:String,required:true}, 
    country: { type: String },
    state: { type: String },
    city:{type:String},
    pinCode: { type: Number },
    landmark: { type: String }, 
    addressLine: { type: String },
   
})

interface orderSchemaProps extends mongoose.Document{
    user:mongoose.Schema.Types.ObjectId;
    clerkId:string;
    orderItems:orderItemSchemaProps[];
    shippingAddress:shippingAddressSchemaProps;
    paymentResult:{id:string,status:string};
    totalPrice:number;
    status:"pending" | "processed" | "shipped" | "delivered" | "cancelled";
    deliveredAt?:Date;
    shippedAt?:Date;
}
const orderSchema=new mongoose.Schema<orderSchemaProps>({
user:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
clerkId:{type:String,required:true},
orderItems:[orderItemSchema],
shippingAddress:{type:shippingAddressSchema},
paymentResult:{id:String,status:String},
totalPrice:{type:Number,required:true,min:0,default:0},
status:{type:String,enum:["pending","processed","shipped","delivered","cancelled"],default:"pending"},
deliveredAt:{type:Date},
shippedAt:{type:Date},

},{
    timestamps:true
})


const orderModels=mongoose.model<orderSchemaProps>('orders',orderSchema)
export default orderModels;