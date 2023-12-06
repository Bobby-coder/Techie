import aws from "aws-sdk";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

// AWS setup
export const s3 = new aws.S3({
  region: process.env.BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
