const crypto=require('crypto')
const mongoose=require('mongoose');
const validator = require('validator');
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
   name:{
    type:String,
    required:[true,'Please tell us your name!']
   },

   email:{
    type:String,
    required:[true,'please provide your email!'],
    unique:true,
    lowercase:true,  //whatever uppercase char are there in the gmail that converted to lowercase
    validate:[validator.isEmail,'please provide a valid email']  
  },
   photo:String,
   role:{
      type:String,
      enum:['user','guide','lead-guide','admin'],//only these kind of values are allowed
      default:'user'
   },
   password:{
    type:String,
    required:[true,'please provide a password'],
    minlength:8,
    select:false
   },

   passwordConfirm:{
    type:String,
    required:[true,'please provide a password'],
    minlength:8,
   validate:{
      //This only works on CREATE and SAVE!!!
      //checking password and confirmpassword are same
      validator:function(el){
         return el==this.password;
      },
      message:'Passwords are not same'
   } },
   passwordChangedAt:Date,
   passwordResetToken:String,
   passwordResetExpires:Date,
   active:{
      type:Boolean,
      default:true,
      select:false
   }

})

//mongoose middleware
userSchema.pre('save',async function(next){
   //if the modification is not on passwords then don't encrypt or hashing the password again and again so we are returning and calling the next middleware
   //this->this means current document
   if(!this.isModified('password'))return next();

   //passing passwords and number(nothing but how strongly you want to encrypt)
   this.password=await bcrypt.hash(this.password,12);

   //why we set it into null is we don't want to store two times same password because the comfirm password just to check if we set to undefined the mongoose won't create that field
   this.passwordConfirm=undefined;

   next()
})

  //-this mongoose middleware is to set passwordchangedat when we reset the password and save this middleware will run automatically
userSchema.pre('save',function(next){
     //if the password is not modified or the document is newly created than don'tneed to do anything (this middleware runs everytime wehn we save so create a new document)
   if(!this.isModified('password') || this.isNew)return next()

   //Sometime storing a data in database is slower than the creating a token so  we are reducing 1s from the time so there will be no issue in login
   this.passwordChangedAt=Date.now()-1000;

   next();
})

 //-This middleware won't allow to display the user who's active:false (here why we are using regular function means then only we can able to access the this keyword) 
 //Which function and all starts with find that functions will apply this middleware before 
 userSchema.pre(/^find/,function(next){
   //this points to current query
   this.find({active:{$ne:false}});
   next();
})


//instance method

userSchema.methods.correctPassword=async function(candidatePassword,userPassword) {
   return await bcrypt.compare(candidatePassword,userPassword)
   
}

userSchema.methods.changesPasswordAfter=function(JWTTimestamp){

   if(this.passwordChangedAt){
      //convert to seconds and base 10 number
    const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10)
     
   // console.log(changedTimestamp,JWTTimestamp)
     
     return JWTTimestamp<changedTimestamp
   }

   //False means Not Changed
   return false

}

userSchema.methods.createPasswordResetToken=function(){
   // Generates a 32-character secure random hexadecimal string (256-bit)
    const resetToken=crypto.randomBytes(32).toString('hex')
    
    //bascially encryption of token to avoid attacker to access the token and reset
   //storing in the current user "this"
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')

     console.log({resetToken},this.passwordResetToken)

   //setting the passwordResetExpires to 10 min  
    this.passwordResetExpires=Date.now()+10*60*1000;

    return resetToken;
 }


//Model name always starts with uppercase
const User=mongoose.model('User',userSchema)

module.exports=User;