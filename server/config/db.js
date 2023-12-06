import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

// Database URI
const dbUri = process.env.DB_URI || "";

// Function to connect with db
export async function connectDB() {
  try {
    const data = await mongoose.connect(dbUri);
    console.log(`Database connected with ${data.connection.host}`);
  } catch (err) {
    console.log(err);
    // Reconnect after 5 seconds
    setTimeout(connectDB, 5000);
  }
}
