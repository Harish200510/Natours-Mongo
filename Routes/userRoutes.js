const express=require('express')

const {getAllUsers,getUser,createUser,updateUser,deletUser}=require('./../controllers/userController')

const router=express.Router();


 router
  .route('/')
  .get(getAllUsers)
  .post(createUser)

 router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deletUser)


module.exports=router
