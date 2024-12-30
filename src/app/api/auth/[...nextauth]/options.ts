import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel  from "@/model/user";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"credentials",
            credentials:{
                email: { label: "Username", type: "text",placeholder:"Enter your username" },
                password: { label: "Password", type: "password" }
            }, 
            async authorize(credentials:any): Promise<any> {
                // Add logic here to look up the user from the credentials supplied
                await dbConnect();
                try {
                    const user=await UserModel.findOne({ 
                        $or: [
                            {email: credentials.identifer},
                            {username: credentials.identifer}
                        ]
                     });
                     if (!user) {
                        throw new Error('No user found')
                     }
                     if(!user.isVerified){
                        throw new Error('User is not verified')
                     }
                    const isPasswordCorrect= await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    }
                    else{
                        return user;
                    }
                } catch (error:any) {
                    throw new Error(error.message)
                }
            }
        })
    ],
    pages:{
        signIn: '/sign-in',
        
    },
    session:{
        strategy:'jwt'
    },
    secret: process.env.SECRET,
    callbacks:{
        async session({ session,  token }) {
            if (token) {
                session.user._id=token.id
                session.user.isVerified=token.isVerified;
                session.user.isAcceptingMessages=token.isAcceptingMessages;
                session.user.username=token.username;     
            }
            return session;
        },
          async jwt({ token, user }) {
            if(user){
                token.id=user._id?.toString()
                token.isVerified=user.isVerified,
                token.isAcceptingMessages=user.isAcceptingMessages,
                token.username=user.username
            }
            return token;
        }
    }
}