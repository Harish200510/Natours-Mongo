const User=require('./../models/userModel')
const catchAsync=require('./../utils/catchAsync')
const AppError=require('./../utils/appError')

const filterObj=(obj,...allowedFields)=>{

    const newObj={}

    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))newObj[el]=obj[el];
    })

    return newObj
}


exports.getAllUsers=catchAsync(async(req,res,next)=>{

       const users=await User.find();

       res.status(200).json({
        status:"success",
       results:users.length,
       data:{
        users
       }
    })
    next()
})

exports.updateMe=catchAsync(async(req,res,next)=>{

    //1)Create error is user POSTs password data

    if(req.body.password || req.body.passwordConfirm){
       return next(new AppError('This Route is not for password updates. Please user /UpdateMYPassword',400))
    }

    //2)Filtered out unwanted fields names that are not allowed to be updated

    //-we are filtering beacuse suppose if user entered 'role='admin'' then it is risky so we are filtering the 'name & email' and allowing them to change only that
    const filteredBody=filterObj(req.body,'name','email')

    //3)Update user document
    const updatedUser =await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });
    


    res.status(200).json({
        status:'success',
        data:{
                user:updatedUser
        }
    })
})

exports.deleteMe=catchAsync(async(req,res,next)=>{

    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:'success',
        data:null
    })

})

exports.getUser=(req,res)=>{
       res.status(500).json({
        status:"error",
        message:"This route is not yet defined"
    })
}

exports.createUser=(req,res)=>{
   
    res.status(500).json({
        status:"error",
        message:"This route is not yet defined"
    })    
}

exports.updateUser=(req,res)=>{

      res.status(500).json({
        status:"error",
        message:"This route is not yet defined"
    })

}


exports.deletUser=(req,res)=>{
       res.status(500).json({
        status:"error",
        message:"This route is not yet defined"
    })

}