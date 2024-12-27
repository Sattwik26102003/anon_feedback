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
            const db = await mongoose.connect(process.env.MONGODB_URI || '',{})
            connection.isConnected = db.connections[0].readyState
            log('new connection created')
        } catch (error) {
            
        }
        
    }
}

export default dbConnect;