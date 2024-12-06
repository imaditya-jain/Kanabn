import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;



if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not defined. Please set it in your environment.");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectToDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGO_URI, {

                bufferCommands: false,
            })
            .then((mongooseInstance) => {
                console.log("MongoDB connection established successfully.");
                return mongooseInstance;
            })
            .catch((error) => {
                console.error("Failed to connect to MongoDB:", error);
                throw new Error("MongoDB connection error. Please check the MONGO_URI and database status.");
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("Error while finalizing MongoDB connection:", error);
        throw error;
    }
};

export default connectToDatabase;
