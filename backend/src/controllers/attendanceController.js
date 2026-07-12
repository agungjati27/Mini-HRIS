const supabase =
require("../config/supabase");

const DEFAULT_CHECK_IN_LIMIT = "08:00";
const DEFAULT_CHECK_OUT_START = "16:30";

const getJakartaDate = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(new Date());

const getJakartaMinutes = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta"
    }).formatToParts(date);

    const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

    return hour * 60 + minute;
};

const timeToMinutes = (time) => {
    const [hour = "0", minute = "0"] = String(time).split(":");
    return Number(hour) * 60 + Number(minute);
};

const getAttendanceStatus = (date = new Date()) =>
    getJakartaMinutes(date) > timeToMinutes(DEFAULT_CHECK_IN_LIMIT) ? "Telat" : "Hadir";


const {
    generateQR

}=require("../services/qrService");




// Generate QR Absensi

const generateAttendanceQR =
async(req,res)=>{


    try{


        const qrData={


            type:
            "attendance",


            date:
            getJakartaDate()


        };



        const qr =
        await generateQR(
            qrData
        );



        res.json({

            message:
            "QR Absensi berhasil dibuat",


            qr


        });



    }


    catch(error){


        res.status(500)
        .json({

            message:error.message

        });


    }


};

// Scan QR dan Check In Pegawai

const scanAttendance = async(req,res)=>{


    try{


        const userId = req.user.id;

        // mencari employee berdasarkan profile login

const {
    data: employee,
    error: employeeError
} = await supabase
.from("employees")
.select("*")
.eq("profile_id", userId)
.single();


console.log("USER ID TOKEN :", userId);

console.log("EMPLOYEE RESULT :", employee);

console.log("EMPLOYEE ERROR :", employeeError);



if(employeeError || !employee){

    return res.status(404).json({

        message:
        "Data employee tidak ditemukan"

    });

}

        const {
            qr_code,
            latitude,
            longitude

        } = req.body;



        if(!qr_code){


            return res.status(400)
            .json({

                message:
                "QR Code tidak ditemukan"

            });


        }



        // cek apakah sudah absen hari ini


        const {
            data: existingAttendance

        } = await supabase


        .from("attendance")


        .select("*")


        .eq(
            "employee_id",
            employee.id
        )


        .eq(

            "date",

            getJakartaDate()

        )

        .maybeSingle();





        if(existingAttendance){


            return res.status(400)
            .json({

                message:
                "Anda sudah melakukan absensi hari ini"

            });


        }





        // simpan absensi


        const {

            data,

            error

        } = await supabase


        .from("attendance")


        .insert({

            employee_id:employee.id,


            qr_code,


            latitude,


            longitude,


            date:
            getJakartaDate(),

            check_in:
            new Date().toISOString(),

            status:getAttendanceStatus()



        })


        .select()

        .single();





        if(error){

            throw error;

        }




        res.json({

            message:
            "Absensi masuk berhasil",


            data


        });



    }


    catch(error){


        console.log(error);


        res.status(500)
        .json({

            message:error.message

        });


    }


};


// Checkout Absensi

const checkoutAttendance = async(req,res)=>{


    try{


        const userId = req.user.id;



        // cari employee


        const {

            data:employee,

            error:employeeError


        } = await supabase


        .from("employees")


        .select("*")


        .eq(
            "profile_id",
            userId
        )


        .single();




        if(employeeError || !employee){


            return res.status(404).json({

                message:
                "Data employee tidak ditemukan"

            });


        }





        const today = getJakartaDate();





        // cari absensi hari ini


        const {

            data:attendance,

            error


        } = await supabase


        .from("attendance")


        .select("*")


        .eq(
            "employee_id",
            employee.id
        )


        .eq(
            "date",
            today
        )


        .single();





        if(error || !attendance){


            return res.status(404).json({

                message:
                "Anda belum melakukan absensi masuk"

            });


        }





        if(attendance.check_out){


            return res.status(400).json({

                message:
                "Anda sudah melakukan absensi keluar"

            });


        }

        if(getJakartaMinutes() < timeToMinutes(DEFAULT_CHECK_OUT_START)){


            return res.status(400).json({

                message:
                "Check out belum bisa dilakukan sebelum jam 16:30 WIB"

            });


        }





        const checkOut =
        new Date();




        const checkIn =
        new Date(
            attendance.check_in
        );





        const duration =
        Math.floor(

            (
                checkOut - checkIn
            )
            /
            (1000*60)

        );





        const {

            data,

            error:updateError


        } = await supabase


        .from("attendance")


        .update({

            check_out:checkOut.toISOString(),

            work_duration:duration


        })


        .eq(
            "id",
            attendance.id
        )


        .select()


        .single();





        if(updateError){

            throw updateError;

        }





        res.json({

            message:
            "Absensi keluar berhasil",


            data


        });




    }


    catch(error){


        console.log(error);


        res.status(500).json({

            message:error.message

        });


    }


};

// ===============================
// TRACKER ABSENSI HARI INI
// ===============================

const getTodayAttendance = async(req,res)=>{


    try{


        const userId=req.user.id;

        console.log("USER ID TRACKER :", userId);

        // cari employee


        const {
    data:employee,
    error:employeeError
}=await supabase
.from("employees")
.select("*")
.eq(
    "profile_id",
    userId
)
.single();



console.log(
    "EMPLOYEE TRACKER :",
    employee
);


console.log(
    "EMPLOYEE ERROR :",
    employeeError
);




        if(employeeError || !employee){


            return res.status(404)
            .json({

                message:
                "Data employee tidak ditemukan"

            });


        }




        const today =
        getJakartaDate();




        const {

            data:attendance,

            error

        }=await supabase


        .from("attendance")

        .select("*")

        .eq(
            "employee_id",
            employee.id
        )

        .eq(
            "date",
            today
        )

        .maybeSingle();




        if(!attendance){


            return res.json({

                status:
                "Belum Absen",

                data:null

            });


        }




        let status;



        if(
            attendance.check_in &&
            !attendance.check_out
        ){


            status =
            "Sudah Check In";


        }
        else if(
            attendance.check_out
        ){


            status =
            "Selesai";


        }




        res.json({

            status,

            data:attendance

        });



    }


    catch(error){


        res.status(500)
        .json({

            message:error.message

        });


    }


};

// ===============================
// RIWAYAT ABSENSI PEGAWAI
// ===============================


const getAttendanceHistory = async(req,res)=>{


    try{


        const userId=req.user.id;
        
        console.log(
    "USER ID HISTORY :",
    userId
);


        const {

            data:employee

        }=await supabase


        .from("employees")

        .select("*")

        .eq(
            "profile_id",
            userId
        )

        .single();

        console.log(
    "EMPLOYEE HISTORY :",
    employee
);


        if(!employee){


            return res.status(404)
            .json({

                message:
                "Employee tidak ditemukan"

            });


        }




        const {

            data,

            error

        }=await supabase


        .from("attendance")

        .select("*")

        .eq(
            "employee_id",
            employee.id
        )

        .order(

            "date",

            {
                ascending:false
            }

        );




        if(error){

            throw error;

        }



        res.json({

            message:
            "Riwayat absensi berhasil diambil",

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

generateAttendanceQR,

scanAttendance,

checkoutAttendance,

getTodayAttendance,

getAttendanceHistory

};
