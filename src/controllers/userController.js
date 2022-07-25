const mongoose=require("mongoose")
const userModel = require("../models/userModel")
const bcrypt=require("bcrypt")

const isValid = function (value) {
    if (typeof value !== "string" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  const isValidUserDetails = (UserDetails) => {
    if (/^(?=.*?[a-zA-Z])[. %?a-zA-Z\d ]+$/.test(UserDetails)) return true;
  };

  const isValidName = (name) => {
    if (/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name)) return true;
  };

const userCreate=async function(req,res){
    try{
    let data=req.body
const{fname,lname,email,phone,password,address}=data

// * fnameValidation

if(!isValid(fname)){
    return res.status(400).send({status:false,message:"fname is required"})
}
if(!isValidName(fname)){
    return res.status(400).send({status:false,message:`${fname} is not a valid formate  for fname`})
}

// * lnameValidation

if(!isValid(lname)){
    return res.status(400).send({status:false,message:"lname is required"})
}
if(!isValidName(lname)){
    return res.status(400).send({status:false,message:`${lname} is not a valid formate  for lname`})
}

// * emailValidation

if(!isValid(email)){
    return res.status(400).send({status:false,message:"email is required"})
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return res.status(400).send({status:false,message:`${email} is not a valid formate  for email`})
}

const checkEmail=await userModel.findOne({email:email})
if(checkEmail){
    return res.status(400).send({status:false,message:`${email} is already used please use another email`})

}
// * phoneValidation
if(!isValid(phone)){
    return res.status(400).send({status:false,message:"phoneNumber is required"})
}

if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)){
    return res.status(400).send({status:false,message:`${phone} is invalid please enter a valid phone number`})
}
const checkPhone=await userModel.findOne({phone:phone})
if(checkPhone){
    return res.status(400).send({status:false,message:`${phone} is already used please use another phoneNumber`})

}
// * passwordValidation
if(!isValid(password)){
    return res.status(400).send({status:false,message:"password is required"})
}
if(password.length<8||password.length>15){
    return res.status(400).send({status:false,message:"password must contains atleast 8 charcaters upto 15"})

}
//* password decrypt
var saltRounds = 10;   
const hash = bcrypt.hashSync(password, saltRounds);
data.password=hash // * assigning dcrypted password 

// *addressValidation
if(!isValid(address)){
    return res.status(400).send({status:false,message:"address is required"})
}
data.profileImage=req.uploadedFileURL
data.address=JSON.parse(data.address)

const{street,city,pincode}=data.address.shipping

//* streetValidation

if(!isValid(street)){
    return res.status(400).send({status:false,message:"street is required in address"})
}
if(!isValidUserDetails(street)){

    return res.status(400).send({status:false,message:`${street} is inavlid formate for street`})

}

//* cityValidation

if(!isValid(city)){
    return res.status(400).send({status:false,message:"city is required"})
}
if(!isValidName(city)){
    return res.status(400).send({status:false,message:`${city} is not a valid formate  for city`})
}

// * pincodeValidation

if(!isValid(pincode)){
    return res.status(400).send({status:false,message:"pincode is required"})
}
if(!isValidName(city)){
    return res.status(400).send({status:false,message:`${pincode} is not a valid formate  for city`})
}


const createUser=await userModel.create(data)
res.status(201).send({status:true,message:"User created successfully",data:createUser})
}
catch(error){
    res.status(500).send({status:false,error:error.message})
}}
module.exports={userCreate}