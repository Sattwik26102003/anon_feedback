import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    console.log("🛠️ Starting delete-message API route...");
  console.log("🔌 Connecting to DB...");
  await dbConnect();
  console.log("✅ DB Connected");

  const session = await getServerSession(authOptions);
  console.log("🟢 Session:", session);

  if (!session || !session.user) {
    console.log("❌ No session or user found.");
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const user = session.user;
  console.log("👤 Authenticated User:", user);

  const { messageId } = await request.json();
  console.log("📨 Request to delete Message ID:", messageId);

  if (!messageId) {
    console.log("⚠️ No messageId provided in request.");
    return Response.json(
      { success: false, message: "Message ID is required" },
      { status: 400 }
    );
  }

  const messageObjectId = new mongoose.Types.ObjectId(messageId);
  console.log("🆔 Converted to ObjectId:", messageObjectId);

  try {
    console.log("🛠️ Attempting to update user document...");

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id, "message._id": messageObjectId },
      { $pull: { message: { _id: messageObjectId } } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("⚠️ Message not found or not deleted.");
      return Response.json(
        { success: false, message: "Message not found or unable to delete" },
        { status: 404 }
      );
    }

    console.log("✅ Message deleted successfully.");
    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return Response.json(
      { success: false, message: "An error occurred while deleting the message" },
      { status: 500 }
    );
  }
}
