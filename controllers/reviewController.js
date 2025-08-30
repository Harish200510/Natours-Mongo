const Review=require('./../models/reviewModel')
const catchAsync=require('./../utils/catchAsync')

exports.getAllReviews=catchAsync(async(req,res,next)=>{
         
    const reviews=Review.find();

    res.status(200).json({
        status:'success',
        results:reviews.length,
        data:{
          reviews  
        }
    })
    next()
})

exports.createReviews=catchAsync(async(req,res,next)=>{
    //if unwanted fields is there that was not there in schmea that will be ignored 
    const newReview=await Review.create(req.body);

    res.status(200).json({
        status:'success',
        data:{
            review:newReview
        }
    })
})