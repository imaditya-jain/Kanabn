import mongoose from 'mongoose'

const connectToDatabase = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while connecting to database: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
    }
}

export default connectToDatabase