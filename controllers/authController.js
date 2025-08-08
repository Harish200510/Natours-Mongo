const crypto=require('crypto')
const {promisify}=require('util')
const jwt=require('jsonwebtoken')
const sendEmail=require('./../utils/email')
const catchAsync = require('../utils/catchAsync');
const User=require('./../models/userModel')
const AppError=require('./../utils/appError');
const { appendFile } = require('fs');

const signToken=id=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
}

const createSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id)

    const cookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV=='production ')cookieOptions.secure=true
    
    res.cookie('jwt',token,cookieOptions)

    //which we will not allow password to be displays when we sign in
    user.password=undefined;

    res.status(statusCode).json({
        status:'Success',
        token,
        data:{
            user
        }
    })
}

exports.signup=catchAsync(async(req,res,next)=>{
    //creating a new user
   /* {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    }*/
    const newUser=await User.create(req.body);

    //jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
    
    createSendToken(newUser,201,res)
    // const token=signToken(newUser._id)

    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         user:newUser
    //     }
    // })
    next()
})


exports.login=catchAsync(async(req,res,next)=>{
    //allowing the user to login with the email and password
     const {email,password}=req.body;

     //1)check if email and password exist
     if(!email || !password){
        return next(new AppError('Please provide email and password!',400))
     }

     //2)check if user exsits && password is correct

     const user=await User.findOne({email:email}).select('+password')


     if(!user || !await user.correctPassword(password,user.password)){
        //401->unauthorized
        return next(new AppError('Incorrect email or password',401))
     }
     
     //3)If everything ok, send token to client

     createSendToken(user,200,res)

    //  const token=signToken(user._id);

    //  res.status(200).json({
    //     status:'success',
    //     token
    //  })
     
})


exports.protect=catchAsync(async(req,res,next)=>{
     //1)Getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
       
        //splitting the string by space and getting the token 
        token=req.headers.authorization.split(' ')[1]
        //console.log(token)
    }
    //check token is there
    if(!token){
        //401->unauthorized access
        return next(new AppError('You are not logged in! please log in to get access',401))
    }
    
    //2)Validate or verification token

       const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
      //in decode we will have the user database id
      
    //3)check if user still exsists (what if token exist meanwhile the user deleted the account so check the user exist or not or if user changes there credentials)

    const currentUser=await User.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist',401))
    }

    //4)Check if user changed password after the token was issued
     //iat-issued at
    if( currentUser.changesPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again',401))
    }


    //GRANT ACCESS TO PROTECTED ROUTE
    req.user=currentUser;
    next()
   

})

//here we want to receive the roles we can't get that in (req,res,next)
//so what we are going to do is we are going to use wrapper function that accepts the roles in array and return middleware function  
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        //roles is an array ['admin','lead-guide']
        //since we want to access the current user role that was availabe in the req.user.role because in the "protect" function we stored the current user detail
       //1)If the roles was not one of the given roles then user is restricted to do that operation 
       if(!roles.includes(req.user.role)){
        return next(new AppError('You do not have permission to perform this action',403))
       }
       next()
    }
}


exports.forgotPassword=catchAsync(async(req,res,next)=>{
     //1)Get user based on POSTed email

      const user=await User.findOne({email:req.body.email})
      //checking the user is exist or not
      if(!user){
        return next(new AppError('There is no user with email address',404))
      }

      //2)Generate the random reset token
      const resetToken=user.createPasswordResetToken()
      //makesure validateBeforeSave:false because if we modify the document we have to save it , so when you saving it set this beacuse so feild we may specify required:true like that so do this
      await user.save({validateBeforeSave:false}) //since we are modifying the current user datas line adding passwordResetExpires and passwordResetToken so we have to save it otherwise it won't added to the database
     
      //3)send it to user's  email
    
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

      const message=`Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\n If you didn't forget your password, please ignore thie email`
 
      //Why we are using try catch block is if something went wrong we will set the passwordResetToken,passwordResetExpires to undefined and please makesure to save the data
      try {
        
         await sendEmail({
        email:user.email,
        subject:'Your password reset token (Valid for 10 min)',
        message
      })

      res.status(200).json({
        status:'success',
        message:'Token send to email!'
      })
      } catch(err) {
       
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
      await user.save({validateBeforeSave:false})
      return next(new AppError('There was an error sending the email.Try again later!',500))
      }

      next()

   
})


exports.resetPassword=catchAsync(async(req,res,next)=>{
   
    //1)get user based on the token
  
    //-we basically encrypt the given token and compare with the token encrypted and stored in database
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
    //-access the user with the given token is user not exist return error message
    const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})

    //2)If token has not expired, and there is user,set the new password

    if(!user){
        return next(new AppError('Token is invalid or has expired',400))
    }

    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    user.passwordResetToken=undefined
    user.passwordResetExpires=undefined
    await user.save(); //here we don't need to turn of the validator because we need to check password and comfirm password are same that will be done by mongodb

    //3)Update changedPasswordAt property for the user

    //4)Log the user in, send JWT

    createSendToken(user,201,res)

    // const token=signToken(user._id)

    // res.status(201).json({
    //     status:'success',
    //     token
    // })
    next()
})


exports.updatePassword=async(req,res,next)=>{

    //1)Get the user from the collection
    //- if user is loggedin then the user will be available in req
      const user=await User.findById(req.user.id).select('+password') //we have to explicitly select the password to get the password because we set select=false


    //2)Check if POSTed current password is correct

    if(!await user.correctPassword(req.body.passwordCurrent,user.password))return next(new AppError('Your Current user password is wrong',401))

    //3)If so,update password

    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    await user.save()
    //User.findByIdAndUpdate will NOT work as intended!

    //4)Log user in,send JWT

    createSendToken(user,200,res)
}

