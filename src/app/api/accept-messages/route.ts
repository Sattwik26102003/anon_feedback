import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
    console.log("POST /api/your-route called");
    await dbConnect();
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    const user: User = session?.user;

    if (!session || !session.user) {
        console.log("No session or user found");
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 404
            }
        );
    }
    console.log("User:", user);
    const userId = user._id;
    console.log("User ID:", userId);

    const body = await request.json();
    console.log("Request Body:", body);

    const { acceptMessages } = body;
    console.log("Accept Messages:", acceptMessages);
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId),
            { $set: { isAcceptingMessage: acceptMessages } },
            { new: true }
          );
          
          if (!updatedUser) {
            console.log("❌ Update failed — user not found?");
          } else {
            console.log("✅ User updated:", updatedUser);
          }
          
          if(acceptMessages){
            return Response.json({
                success: true,
                message: "user updated to accepting messages",
                updatedUser
            });
          }
        return Response.json({
            success: true,
            message: "user updated to stop accept messages",
            updatedUser
        });
    } catch (error) {
        console.log("Error accepting messages:", error);
        return Response.json(
            {
                success: false,
                message: "failed to update user to accept messages"
            },
            {
                status: 500
            }
        );
    }
}

export async function GET(request: Request) {
    console.log("GET /api/your-route called");
    await dbConnect();
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    const user: User = session?.user;

    if (!session || !session.user) {
        console.log("No session or user found");
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 404
            }
        );
    }

    const userId = (user as any)._id;
    console.log("User ID:", userId);

    try {
        const foundUser = await UserModel.findById(userId);
        console.log("Found user:", foundUser);

        if (!foundUser) {
            console.log("User not found in DB");
            return Response.json(
                {
                    success: false,
                    message: "user not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage,
                user
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error fetching user:", error);
        return Response.json(
            {
                success: false,
                message: "failed to update user to accept messages"
            },
            {
                status: 500
            }
        );
    }
}