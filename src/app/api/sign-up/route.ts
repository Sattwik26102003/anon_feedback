import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { verify } from "crypto";

export async function POST(request:Request){
    await dbConnect();
    try{
        const {username,email,password} =await request.json()
        const existingUserVerifiedByUsername= await UserModel.findOne({
            username,
            isVerified:true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:'Username already exists'
            },
            {
                status:400
            })
        }
        const existingUserVerifiedByEmail= await UserModel.findOne({
            email,
            isVerified:true
        })
        const verifyCode = Math.random().toString(36).slice(2, 8);
        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success:false,
                    message:'Email already exists'
                },
                {
                    status:400
                })
            }
            else{
                const hashedPassword= await bcrypt.hash(password,10)
                existingUserVerifiedByEmail.password=hashedPassword
                existingUserVerifiedByEmail.verifyCode=verifyCode
                existingUserVerifiedByEmail.verifyCodeExpiry= new Date(Date.now()+3600000)
                await existingUserVerifiedByEmail.save()
            }
        }
        else{
            const salt= await bcrypt.genSalt(10)
            const hashedPassword= await bcrypt.hash(password,salt)
            const expiry= new Date()
            expiry.setHours(expiry.getHours()+1)    
            // const newUser= new UserModel({
            //     username,
            //     email,
            //     password:hashedPassword
            // })
            const newUser=await UserModel.create({
                username,
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiry
            })
            await newUser.save()
        }
        const emailResponse=await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:'Error sending verification email'
            },
            {
                status:500
            })
        }
        else{
            return Response.json({
                success:true,
                message:'User created successfully,please verify your email address'
            },
            {
                status:201
            })
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        return Response.json({
            success:false,
            message:'Error sending verification email'
        },
        {
            status:500
        })
    }
}