import multer from 'multer';

const storage = multer.memoryStorage(); // Store in memory (buffer), not disk

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter,
});

export default upload;
