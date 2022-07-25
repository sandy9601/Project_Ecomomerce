const mongoose=require("mongoose")
const userModel = require("../models/userModel")
const bcrypt=require("bcrypt")

const userCreate=async function(req,res){

    let data=req.body
const{fname,lname,email,phone,password,address}=data
console.log(password)

data.profileImage=req.uploadedFileURL
data.address=JSON.parse(data.address)
//* decrypt
var saltRounds = 10;   
const hash = bcrypt.hashSync(password, saltRounds);
data.password=hash // * assigning dcrypted password 
const createUser=await userModel.create(data)
res.status(201).send({status:true,message:"User created successfully",data:createUser})
}

//...................................................getapi.............................................................//
const getapi =async function(req,res){
    try{
    let userId=req.param.userId
    let user=await userModel.findOne(userId)
    res.status(200).send({status: true, data:user})

}catch(err){
    res.status(500).send({status:false, msg: err.message})
}
}






module.exports={userCreate,getapi}