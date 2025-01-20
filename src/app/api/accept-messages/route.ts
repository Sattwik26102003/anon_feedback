import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import {User} from "next-auth";

export async function POST(request:Request){
    await dbConnect();
    const session=await getServerSession(authOptions);
    const user:User=session?.user;
    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },
        {
            status:404
        }
        )
    }
    const userId=user._id;
    const {acceptMessages}=await request.json();
    try{
        const updatedUser=await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages:acceptMessages},
            {new:true}
        )
        return Response.json({
            success:true,
            message:"user updated to accept messages",
            updatedUser
        })  
    }
    catch(error){
        console.log("error accepting messages",error);
        return Response.json({
            success:false,
            message:"failed to update user to accept messages"
        },
        {
            status:500
        }
    )
    }
}

export async function GET(request:Request){
    await dbConnect();
    const session=await getServerSession(authOptions);
    const user:User=session?.user;
    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },
        {
            status:404
        }
        )
    }
    const userId=user._id;
    try {
        const foundUser=await UserModel.findById(userId);
    if(!foundUser){
        return Response.json({
            success:false,
            message:"user not found"
        },
        {
            status:404
        }
    )
    }
    return Response.json({
        success:true,
        isAcceptingMessages:foundUser.isAcceptingMessage,
        user
    },
    {status:200}
    )
    } catch(error){
        console.log("error accepting messages",error);
        return Response.json({
            success:false,
            message:"failed to update user to accept messages"
        },
        {
            status:500
        }
    )
    }
    
}
