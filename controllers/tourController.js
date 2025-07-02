const fs=require('fs');

const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`,"utf-8"))

exports.checkID=(req,res,next,val)=>{

    if(val*1>tours.length){
        return res.status(404).json({
            status:"fail",
            message:"Invalid Id"
        })
    }
    next();

}

exports.checkBody=(req,res,next)=>{
         if(!req.body.name || !req.body.price){
            return res.status(400).json({
                status:"fail",
                message:"Missing name or price"
            })
         }
         next();
}

exports.getAllTours=(req,res)=>{
    res.status(200).json({
        status:'success',
        requestTime:req.requestTime,
        data:{
            tours
        }
    })
}

exports.getTour=(req,res)=>{
    //converting to integer
    const id=req.params.id*1

   
    //find function loop through the object and get the value
    const tour=tours.find(el=>el.id===id) 
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
      
}

exports.createTour=(req,res)=>{

    const data=req.body;
   
    const newId=tours[tours.length-1].id+1
   
    const newTour=Object.assign({id:newId},data)
   
    tours.push(newTour);
   
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{
         res.status(201).json(
            {
            "status":"success",
            datas:{
                tour:newTour
            }

            })
    })
      
}

exports.updateTour=(req,res)=>{

    const id=req.params.id*1;

    

    res.status(200).json({
        status:"success",
        data:{
            tour:'<Updated tour here>'
        }
    })

}

exports.deletTour=(req,res)=>{
    const id=req.params.id*1;
 
   
    res.status(200).json({
        status:"Success",
        data:null
    })

}
