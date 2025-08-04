const nodemailer=require('nodemailer');

const sendEmail=async options=>{

    //1)Create a transporter(which mode of transporter we are gonna use to transport email because the node will not send the email like exampl gmail)
   //you can also use any service like "yahoo" like that
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
        //Activate in gmail "Less secure app" option 
    })

    //2)Define the email options

    const mailOptions={
        from:'Harish Kumar V <testing@harish.in>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        
    }


    //3)Actually send the email

    await transporter.sendMail(mailOptions)
}

module.exports=sendEmail