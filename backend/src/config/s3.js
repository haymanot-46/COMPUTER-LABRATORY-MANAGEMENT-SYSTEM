const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// S3 Configuration (for MinIO or AWS S3)
const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true // Required for MinIO
};

// Create S3 client
const s3Client = new S3Client(s3Config);

// Bucket name
const BUCKET_NAME = process.env.S3_BUCKET || 'clms-uploads';

// File size limits (20MB default)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024 || 20 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Generate unique filename
const generateFileName = (file) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(file.originalname);
  return `${timestamp}-${random}${extension}`;
};

// Multer S3 configuration for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    acl: 'private',
    key: function(req, file, cb) {
      const folder = req.user?.role || 'public';
      const fileName = generateFileName(file);
      cb(null, `${folder}/${fileName}`);
    },
    metadata: function(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    }
  }),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

// Local storage fallback (if S3 not available)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file));
  }
});

const localUpload = multer({
  storage: localStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

// Check S3 connection
const checkS3Connection = async () => {
  try {
    await s3Client.send(new (require('@aws-sdk/client-s3').HeadBucketCommand)({ Bucket: BUCKET_NAME }));
    console.log('✅ S3/MinIO connection successful');
    return true;
  } catch (error) {
    console.error('❌ S3/MinIO connection failed:', error.message);
    console.log('💡 Using local storage as fallback');
    return false;
  }
};

// Delete file from S3
const deleteFile = async (key) => {
  try {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    }));
    console.log(`✅ File deleted: ${key}`);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error.message);
    return false;
  }
};

// Get file URL
const getFileUrl = (key) => {
  if (s3Config.endpoint) {
    return `${s3Config.endpoint}/${BUCKET_NAME}/${key}`;
  }
  return `${process.env.API_URL}/uploads/${key}`;
};

module.exports = {
  s3Client,
  upload,
  localUpload,
  checkS3Connection,
  deleteFile,
  getFileUrl,
  BUCKET_NAME,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};