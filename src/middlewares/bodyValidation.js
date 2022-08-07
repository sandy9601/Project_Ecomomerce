const bodyValidation=async function(req,res,next){
try{
if (Object.keys(req.body).length == 0) {
    return res
      .status(400)
      .send({ status: false, message: "Body couldnot be empty" });
  }

  next()
}
catch(error){
    res.status(500).send({status:false,error:error.message})
}
}

module.exports={bodyValidation}