const multer = require("multer");


const storage = multer.memoryStorage();


const upload = multer({

    storage: storage,

    limits:{
        fileSize: 2 * 1024 * 1024
    },

    fileFilter:(req,file,cb)=>{


        if(
            file.mimetype.startsWith("image/")
        ){

            cb(null,true);

        }
        else{

            cb(
                new Error(
                    "File harus berupa gambar"
                ),
                false
            );

        }

    }


});


module.exports = upload;