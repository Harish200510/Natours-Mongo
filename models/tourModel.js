const mongoose=require('mongoose')
const validator=require('validator')
const slugify=require('slugify')

const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A Tour Must have a Name"],
        unique:true,
        maxlength:[40,'A tour name must have less or equal then 40 character'],
        minlength:[10,'A tour name mustt have more or equal then 10 characters'],
        //  
    },
    slug:String,
    duration:{
      type:Number,
      required:[true,"A tour must have a duration"]
    },
    maxGroupSize:{
      type:Number,
      required:[true,,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{
            
            values:['easy','medium','difficlut'],
            message:'Difficluty is either:easy,medium,diffcult'
        }
    },
    rating:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be below 5.0']
    },
    ratingsAverage:{
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,"A Tour must have a price"]
    },
    priceDiscount:{
        type:Number,
        //checking priceDiscount is less than price
        validate:{

            validator:function(val){
            //this only points to current doc on NEW document creator
            return val<this.price  //
        },
          message:'Discount price ({VALUE}) should be below regular price'
        }
      

    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
   startDates:[Date],
   secretTour:{
    type:Boolean,
    default:false
   }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

//Document Middleware: runs before .save() and .create()
tourSchema.pre('save',function(next){
   this.slug=slugify(this.name,{lower:true})
    next()
})

// tourSchema.pre('save',function(next){
//    console.log('Will save documnent...')
//     next()
// })


// tourSchema.post('save',function(doc,next){
//     console.log(doc)
//     next()
// })


//Query MIDDLEWARE
//whatever the query starts with find 
tourSchema.pre(/^find/,function(next){
   // tourSchema.pre('find',function(next){
    this.find({secretTour:{$ne:true}})

    this.start=Date.now()
    next();
})

tourSchema.post(/^find/,function(docs,next){

    console.log(`Query took ${Date.now()-this.start} millisecond`)
    console.log(docs)
    next()
      
})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    console.log(this.pipeline())
    next()
})

const Tour=mongoose.model('Tour',tourSchema)


module.exports=Tour