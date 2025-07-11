import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/aws.js';

export const uploadAvatar = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName = `avatars/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
