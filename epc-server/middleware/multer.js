// middleware/multer.js
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation update
const fileFilter = (req, file, cb) => {
  // Array of allowed mime types (.doc aur .docx ko bhi validate karne ke liye add kiya)
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'application/pdf',
    'application/msword', // for .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // for .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  // 🔥 SIZE LIMIT INCREASED: 5MB se badha kar 25MB kar diya hai taaki large files block na hon
  limits: { fileSize: 25 * 1024 * 1024 } 
});

module.exports = upload;