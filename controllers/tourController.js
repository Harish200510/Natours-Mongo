const { json } = require('express')
const Tour=require('./../models/tourModel')

exports.getAllTours=async (req,res)=>{

    try{
          console.log(req.query)
          //1A)Filtering
           //creating  a new object with new address which will not affect the original req.query
          const queryObj={...req.query}

          //Removing the fields that we don't want to filter these are like for pagination, sorting, limiting and selecting fields which was not a fields in database
          const excludedFields=['page','sort','limit','fields']        
        
          //Looping through the excludedFields and deleting them from the queryObj that are not required for filtering
          excludedFields.forEach(el=>delete queryObj[el])
          
          //1B)Advanced filtering
          let queryStr=JSON.stringify(queryObj)
          queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
                  
         let query= Tour.find(JSON.parse(queryStr))

         //2)Sorting

         if(req.query.sort){
            //if there is a sort query then we will sort the data
            //we will split the sort query by comma and join it with space to make it a valid mongoose sort query
            const sortBy=req.query.sort.split(',').join(' ')
            query=query.sort(sortBy)
         }
         else{
            //if new data comes in that will at first 
            query=query.sort('-createdAt')
         }


         //Excecuting the query
          const tours=await query

        //Sending the response
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
