const supabase = require("../config/supabase");


// GET SEMUA ABSENSI

const getAllAttendance = async(req,res)=>{


    try{


        const {

            data,

            error

        } = await supabase


        .from("attendance")


        .select(`

            id,

            date,

            check_in,

            check_out,

            status,

            work_duration,

            employees(

                full_name,

                nik,

                department,

                position

            )

        `)


        .order(

            "created_at",

            {
                ascending:false
            }

        );




        if(error){

            throw error;

        }



        res.json({

            message:
            "Data attendance berhasil diambil",

            total:data.length,

            data


        });



    }

    catch(error){


        res.status(500)
        .json({

            message:error.message

        });


    }

};



module.exports={
    getAllAttendance
};