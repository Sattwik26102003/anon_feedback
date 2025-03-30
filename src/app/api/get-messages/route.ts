import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Not Authenticated" },
            { status: 401 } // Changed from 404 to 401
        );
    }

    const user: User = session.user;
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const userMessages = await UserModel.aggregate([
            { $match: { _id: userId } }, // Changed from id:userId to _id:userId
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } },
        ]);

        if (!userMessages || userMessages.length === 0) {
            return Response.json(
                { success: true, message: "No messages found" }, 
                { status: 200 }
            );
        }

        return Response.json(
            { success: true, messages: userMessages[0].messages },
            { status: 200 } // Use 200 for a successful response
        );
    } catch (error) {
        console.log("An unexpected error occurred: ", error);
        return Response.json(
            { success: false, message: "An error occurred while fetching messages" },
            { status: 500 }
        );
    }
}
