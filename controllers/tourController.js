const Tour=require('./../models/tourModel')

exports.getAllTours=async (req,res)=>{

    try{

        const tours= await Tour.find()
     
         res.status(200).json({
             status:'success',
             results:tours.length,
             data:{
                tours
             }
         })
    }catch(err){
        res.status(400).json({
            status:'fail',
            message:err
        })
    }
}

exports.getTour=async (req,res)=>{
   try{

      const tour=await Tour.findById(req.params.id)
      
       res.status(200).json({
           status:'success',
           data:{
               tour
           }
       })
   }catch(err){
       res.send(400).json({
        status:'fail',
        message:err
       })
   }
      
}

exports.createTour=async(req,res)=>{

    try{

        const newTour=await  Tour.create(req.body)
      
            res.status(201).json(
               {
               "status":"success",
               data:{
                   tour:newTour
               }
               })
       }catch(err){
         res.status(400).json({
            staus:'fail',
            message:"Invalid data sent!"
         })
       }

  
}

exports.updateTour=async (req,res)=>{

    try{
      const tour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true //this will run the validator again to check the data
        })

        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        })
    }catch(err){

        res.send(400).json({
            status:fail,
            message:err
        })

    }


}

exports.deletTour=async(req,res)=>{
   try{

       const delTour=await Tour.findByIdAndDelete(req.params.id)
       
       if(!delTour){
        return res.status(404).json({
            status:'fail',
            message:'Tour not Found'
        })
       }
        res.status(200).json({
            status:"Success",
            data:null
        })
   }
   catch(err){
    res.status(400).json({
        status:'fail',
        message:err
    })
   }

}
