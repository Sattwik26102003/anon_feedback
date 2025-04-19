import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/user";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                email: { label: "Username", type: "text", placeholder: "Enter your username" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                // console.log("Authorizing user with credentials:", credentials);
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    });

                    if (!user) {
                        // console.log("No user found for identifier:", credentials.identifier);
                        throw new Error('No user found');
                    }

                    if (!user.isVerified) {
                        // console.log("User is not verified:", user.username || user.email);
                        throw new Error('User is not verified');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        // console.log("Incorrect password for user:", user.username || user.email);
                        throw new Error("Invalid credentials");
                    }

                    // console.log("User authenticated successfully:", user.username || user.email);
                    return user;

                } catch (error: any) {
                    // console.error("Error during authorization:", error.message);
                    throw new Error(error.message);
                }
            }
        })
    ],
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.SECRET,
    callbacks: {
        async session({ session, token }) {
            // console.log("Session callback - token:", token);
            if (token) {
                session.user = session.user || {}; // Ensure session.user exists
                session.user._id = token.id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            // console.log("Session callback - session:", session);
            return session;
        },
        async jwt({ token, user }) {
            // console.log("JWT callback - user:", user);
            if (user) {
                token.id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            // console.log("JWT callback - token:", token);
            return token;
        }
    }
}
export default authOptions;