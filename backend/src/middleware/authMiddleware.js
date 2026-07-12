const supabaseClient = require("../config/supabase");

const authMiddleware = async (req,res,next)=>{


    try{


        const authHeader = req.headers.authorization;



        if(!authHeader){


            return res.status(401).json({

                message:
                "Token tidak ditemukan"

            });


        }



        const token =
        authHeader.split(" ")[1];



        if(!token){


            return res.status(401).json({

                message:
                "Token tidak valid"

            });


        }



        const {
            data,
            error

        } = await supabaseClient.auth.getUser(
            token
        );



        if(error){


            return res.status(401).json({

                message:
                "Token expired atau tidak valid"

            });


        }



        req.user = data.user;
        req.supabase = supabaseClient.createSupabaseClient(token);


        next();



    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};



module.exports = authMiddleware;