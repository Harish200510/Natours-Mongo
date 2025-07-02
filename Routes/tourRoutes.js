const express=require('express')
const {getAllTours,createTour,getTour,updateTour,deletTour,checkID,checkBody}=require('./../controllers/tourController')

const router=express.Router();

router.param('id',checkID)

//create a checkbody middleware
//check if body contains the name ans price property
//If not, send back 400 (bad request)
//Add it to the post handler stack



router
 .route('/')
 .get(getAllTours)
 .post(checkBody,createTour) 


router
 .route('/:id')
 .get(getTour)
 .patch(updateTour)
 .delete(deletTour)

 module.exports=router
