import { s3Client } from '../config/aws.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getV3SignedUrl } from '@aws-sdk/s3-request-presigner';

export const getSignedUrl = async (key, expiresInSeconds = 1200) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getV3SignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return signedUrl;
  
};
