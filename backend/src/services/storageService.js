const supabase = require("../config/supabase");


const uploadProfileImage = async(
    file,
    userId
)=>{


    const fileName =
    `${userId}/profile-${Date.now()}`;


    const {data,error}=await supabase
    .storage
    .from("employee-profile")
    .upload(
        fileName,
        file.buffer,
        {
            contentType:file.mimetype
        }
    );


    if(error){
        throw error;
    }


    const {data:urlData}=supabase
    .storage
    .from("employee-profile")
    .getPublicUrl(
        fileName
    );


    return urlData.publicUrl;

};


module.exports={
    uploadProfileImage
};