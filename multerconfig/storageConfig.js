const multer = require("multer");

//storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const filename = `image-${Date.now()}.${file.originalname}`;
    cb(null, filename);
  },
});

//filter

const filefilter=(req,file,cb)=>{
    if(file.mimetype==="image/png" ||file.mimetype==="image/jpg" || file.mimetype==="image/jpeg" ){
        cb(null,true);
    } else{
        cb(new Error("Only PNG files are allowed."), false); // Reject the file
    }
}

const upload=multer(
    {
        storage:storage,
        fileFilter:filefilter
    }
);

module.exports =upload;