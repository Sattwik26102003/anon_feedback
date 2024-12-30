import { log } from "console";
import mongoose from "mongoose";
import env from "dotenv";
env.config()
type ConnectionObject = {
    isConnected?: number;
}

const connection:ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        log('using existing connection')
    }
    else{
        log('using new connection')
        try {
            console.log(process.env.MONGODB_URI);
            const db = await mongoose.connect(process.env.MONGODB_URI || '',{})
            connection.isConnected = db.connections[0].readyState
            log('new connection created')
        } catch (error) {
            console.log('error connecting to db',error);
            
        }
        
    }
}

export default dbConnect;