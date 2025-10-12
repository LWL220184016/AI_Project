const multer = require('multer');
const path = require('path');

function getUpload(folder) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null, `Server/images/${folder}/`);
            cb(null, path.join(__dirname, '..', 'Server', 'images', `${folder}`)); // Adjust path to your image directory
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

    // Check file type
    function checkFileType(req, file, cb) {
        // Ensure file.originalname is defined
        if (!file.originalname) {
            return cb(new Error('File name is undefined'), false);
        }

        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images Only!'), false);
        }
    }

    // Init upload
    const upload = multer({
        storage: storage,
        limits: { fileSize: 1000000 }, // Limit file size to 1MB
        fileFilter: checkFileType // Add fileFilter to use checkFileType
    });

    return upload;
}

module.exports = getUpload;
