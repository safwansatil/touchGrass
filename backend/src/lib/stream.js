import {StreamChat} from "stream-chat";
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API credentials invalid or missing");
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret);


export const upsertStreamUser = async(userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        // upsert just means create one if it doesnt exist or just update it
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user: ", error);
    }
}


export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream Token ", error)
    }
};