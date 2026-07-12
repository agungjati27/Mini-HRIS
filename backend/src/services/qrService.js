const QRCode = require("qrcode");


const generateQR = async(data)=>{


    try{


        const qr =
        await QRCode.toDataURL(
            JSON.stringify(data)
        );


        return qr;



    }

    catch(error){

        throw error;

    }


};



module.exports={
    generateQR
};