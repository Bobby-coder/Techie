import { s3 } from "../config/s3.js";
import { nanoid } from 'nanoid'

export const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "techie-uploads",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};
