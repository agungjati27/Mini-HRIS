const supabase = require("../config/supabase");

const {
    uploadProfileImage
} = require("../services/storageService");


// ===============================
// REGISTER EMPLOYEE
// ===============================

const registerEmployee = async (req, res) => {

    try {

        const {
            email,
            password,
            nik,
            full_name,
            gender,
            birth_date,
            phone,
            address,
            department,
            position,
            join_date

        } = req.body;

        const avatar = req.file;

        if(!email || !password || !nik || !full_name || !avatar){

            return res.status(400).json({

                message:"Nama lengkap, NIK, email, password, dan foto profil wajib diisi"

            });

        }

        // 1. Create Supabase Auth User

        const {
            data: userData,
            error: userError

        } = await supabase.auth.admin.createUser({

            email,

            password,

            email_confirm: true

        });



        if (userError) {

            throw userError;

        }



        const userId = userData.user.id;



        // 2. Upload Profile Image

        let avatarUrl = null;


        if(avatar){


        const fileName =
        `${Date.now()}-${avatar.originalname}`;



        const uploadAvatar =
        await supabase.storage
        .from("avatars")
        .upload(

        fileName,

        avatar.buffer,

        {

        contentType:
        avatar.mimetype,

        upsert:true

        }

        );



        if(uploadAvatar.error){

        await supabase.auth.admin.deleteUser(userId);

        throw uploadAvatar.error;

        }



        const publicUrl =
        supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);



        avatarUrl =
        publicUrl.data.publicUrl;


        }


        // 3. Insert Profile

const {
    error: profileError

} = await supabase
.from("profiles")
.insert({

    id: userId,

    email: email,

    role: "employee",

    avatar_url: avatarUrl

});


        if (profileError) {

            await supabase.auth.admin.deleteUser(userId);

            throw profileError;

        }




        // 4. Insert Employee Data

        const {
            error: employeeError

        } = await supabase

            .from("employees")

            .insert({

                profile_id: userId,

                nik,

                full_name,

                gender,

                birth_date,

                phone,

                address,

                department,

                position,

                join_date,

                status: "active"

            });



        if (employeeError) {

            await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);

            await supabase.auth.admin.deleteUser(userId);

            throw employeeError;

        }




        res.status(201).json({

            message:
                "Registrasi pegawai berhasil"

        });



    }


    catch(error){


        console.error(
            "REGISTER ERROR:",
            error
        );


        res.status(400).json({

            message:error.message

        });


    }

};





// ===============================
// LOGIN EMPLOYEE
// ===============================


const loginEmployee = async(req,res)=>{


    try{

        const {
            email,
            password
        } = req.body;




        // Login Supabase Auth


        const {

            data,

            error


        } = await supabase.auth.signInWithPassword({

            email,

            password

        });




        if(error){


            return res.status(400).json({

                message:error.message

            });


        }





        const userId = data.user.id;



        // Ambil profile pegawai


        const profileResult = await supabase
.from("profiles")
.select("*")
.eq("email", email);


console.log("EMAIL LOGIN :", email);

console.log(
    "PROFILE QUERY RESULT:",
    profileResult
);


const profile = profileResult.data?.[0];

const profileError = profileResult.error;





        if(profileError){


            throw profileError;


        }





        if(!profile){


            return res.status(404).json({


                message:
                "Profile pegawai tidak ditemukan"


            });


        }





        let fullName = data.user.email;
        if (String(profile.role).trim().toLowerCase() === "employee") {
            const employeeResult = await supabase
                .from("employees")
                .select("full_name")
                .eq("profile_id", userId)
                .single();

            if (!employeeResult.error && employeeResult.data?.full_name) {
                fullName = employeeResult.data.full_name;
            }
        }

        res.json({
            message:
            "Login berhasil",

            user:{
                id:userId,
                email:data.user.email,
                role:profile.role,
                avatar:profile.avatar_url,
                full_name: fullName
            },

            session:data.session
        });



    }


    catch(error){


        console.error(

            "LOGIN ERROR:",

            error.message

        );



        res.status(500).json({

            message:error.message

        });


    }


};





module.exports={

    registerEmployee,

    loginEmployee

};


