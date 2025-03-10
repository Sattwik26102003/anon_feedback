import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import {z} from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";
import { use } from "react";

const UsernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(reqest:Request){
    await dbConnect();
    try {
        const {searchParams}=new URL(reqest.url);
        const queryParam={
            username:searchParams.get("username")
        }
        //validate the query
        const result=UsernameQuerySchema.safeParse(queryParam);
        console.log(result);
        if(!result.success){
           const usernameError=result.error.format().username?._errors || [];
           return Response.json({
               success:false,
               message:usernameError?.length>0?usernameError.join(","):"invalid username",
           },
           {
               status:400
           }
           )
        }
        const {username}=result.data;
        const user=await UserModel.findOne({username,isVerified:true});
        if(user){
            return Response.json({
                success:false,
                message:"username already exists"
            },
            {
                status:400
            }
            )
        }
        return Response.json({
            success:true,
            message:"username is available"
        })

    } catch (error) {
        console.log("error checking username bitch",error);
        return Response.json({
            success:false,
            message:"error checking username"
        },
        {
            status:500 
        }
    
    )
    }
    
}