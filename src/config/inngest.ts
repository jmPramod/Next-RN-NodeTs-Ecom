 import {Inngest} from 'inngest'
import { connectMongooseDB } from './db.connect';

import Auth, { RegisterSchemaValidation } from "../models/user.models"


export const inngest = new Inngest({id:"ecom-app"});

const syncUser=inngest.createFunction(
    {id:'sync-user'}, 
    { event: "user.created" },
    async({event,step})=>{
        await connectMongooseDB();
        const {id,email_addresses,first_name,last_name,image_url}=event.data;
        const newUser={
            clerkID:id, 
            email:email_addresses?.[0]?.email_address,
            firstName:first_name,
            lastName:last_name,
            imageUrl:image_url,
            address:[],
            wishlist:[],
        }
     await Auth.create(newUser);   
    }
)


const deleteUserFromDB=inngest.createFunction(
    {id:'delete-user-from-db'},
  { event: "user.deleted" },
    async({event,step})=>{
        await connectMongooseDB();
        const {id}=event.data;
        await Auth.findOneAndDelete({clerkID:id});
    }   )
export const fuuncction=[syncUser,deleteUserFromDB];