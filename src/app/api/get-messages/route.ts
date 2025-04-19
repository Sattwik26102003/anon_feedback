import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import mongoose from "mongoose";

interface ExtendedUser {
  _id: string;
  email: string;
  username: string;
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const user = session.user as ExtendedUser;

  let userId: mongoose.Types.ObjectId;
  try {
    userId = new mongoose.Types.ObjectId(user._id);
  } catch (e) {
    return Response.json(
      { success: false, message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const userInDb = await UserModel.findById(userId);
    if (!userInDb) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userMessages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$message" },
      { $sort: { "message.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$message" } } },
    ]);

    if (!userMessages || userMessages.length === 0) {
      return Response.json(
        { success: true, message: "No messages found" },
        { status: 200 }
      );
    }

    return Response.json(
      { success: true, messages: userMessages[0].messages },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "An error occurred while fetching messages" },
      { status: 500 }
    );
  }
}
