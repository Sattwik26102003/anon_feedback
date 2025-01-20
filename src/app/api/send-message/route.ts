import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

import {Message} from "@/model/user"
import { log } from "console";

export async function POST(request:Request){
    await dbConnect()

    const {username,content}=await request.json()
    try {
        const user=await UserModel.findOne({username})
        if (!user){
            return Response.json(
                {
                    success:false,
                    message:"User not found"
                },
                {status:404}
            )
        }
        //is user accepting the messages
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success:false,
                    message:"User is not accepting the messages"
                },
                {status:401}
            )
        }
        const newMessage={content,createdAt:new Date()}
        user.message.push(newMessage as Message)
        await user.save
        return Response.json(
            {
                success:false
            }
        )
    } catch (error) {
        console.log("error adding messages",error);
        return Response.json(
            {
                success:false,
                message:"internal server error"
            },
            {status:500}
        )
    }
}