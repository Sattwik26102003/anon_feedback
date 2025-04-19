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
  console.log("🟢 Session:", session);

  if (!session || !session.user) {
    console.log("❌ No session or user found.");
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const user = session.user as ExtendedUser;
  console.log("🟢 Session User:", user);

  let userId: mongoose.Types.ObjectId;
  try {
    userId = new mongoose.Types.ObjectId(user._id);
    console.log("🟢 Session User ID:", userId);
  } catch (e) {
    console.error("❌ Invalid user _id:", user._id);
    return Response.json(
      { success: false, message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const userInDb = await UserModel.findById(userId);
    if (!userInDb) {
      console.log("❌ User not found in DB");
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("📦 User document in DB:", userInDb);

    const userMessages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$message" },
      { $sort: { "message.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$message" } } },
    ]);

    console.log("📊 Aggregated Messages Result:", userMessages);

    if (!userMessages || userMessages.length === 0) {
      console.log("✅ No messages found after aggregation.");
      return Response.json(
        { success: true, message: "No messages found" },
        { status: 200 }
      );
    }

    console.log("✅ Messages retrieved:", userMessages[0].messages);
    return Response.json(
      { success: true, messages: userMessages[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.log("❌ An unexpected error occurred:", error);
    return Response.json(
      { success: false, message: "An error occurred while fetching messages" },
      { status: 500 }
    );
  }
}
