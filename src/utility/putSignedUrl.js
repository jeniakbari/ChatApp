import { s3Client } from '../config/aws.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getV3SignedUrl } from '@aws-sdk/s3-request-presigner';

export const putSignedUrl = async (key, contentType, expiresInSeconds = 300) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'private' // keep private so you can later serve with signed GET URLs
  });

  const signedUrl = await getV3SignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return signedUrl;
};
