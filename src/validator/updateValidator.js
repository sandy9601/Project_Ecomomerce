const userModel = require("../models/userModel");
const {uploadFile}=require("../middlewares/aws")
const bcrypt = require("bcrypt");


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

let parseJSONSafely= function(str){
  try {
      return JSON.parse(str);
  } catch (e) {
      return null
  }
}

let validName = /^[a-zA-Z ]{3,30}$/;
let validPass = /^[a-zA-Z0-9@*&]{8,15}$/;



const updateValidation = async function (req, res, next) {
  try{
  let updateData = req.body;
  let userId=req.params.userId
  if (req.userid != userId) {
    return res
      .status(403)
      .send({
        status: false,
        message: "not authorized",
      });
  }
  var findUser=await userModel.findById({_id:userId})
  var { fname, lname, email, phone, password, address,} =
    updateData;
    let profileImage=req.files

  if (Object.keys(updateData).length == 0&&!profileImage) {
    return res
      .status(400)
      .send({ status: false, message: "please enter atleast one key to update" });
  }
  if (fname) {
    if (!isValid(fname) || !validName.test(fname)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "first Name is not given or invalid firstName",
        });
    }
    findUser.fname = fname;
  }

  if (lname) {
    if (!isValid(lname) || !validName.test(lname)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "last Name is not given or invalid lastName",
        });
    }
    findUser.lname = lname;
  }

  if (email) {
    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send({
        status: false,
        message: `${email} is not a valid formate  for email`,
      });
    }
    let uniqueEmail = await userModel.findOne({ email: email });

    if (uniqueEmail) {
      return res.status(400).send({status: false,
          message: `${email} is   already Used try another email`,
        });
    }
    findUser.email = email;
  }

  

  if (phone) {
    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required" });
    }
    if (!/^[6-9]{1}[0-9]{9}$/.test(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid phone number" });
    }
    let uniquePhone = await userModel.findOne({ phone: phone });
    if (uniquePhone) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${phone} is  already Used try another phoneNumber`,
        });
    }
    findUser.phone = phone;
  }

  if (password) {
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required " });
    }
    if (!validPass.test(password)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Password should be min 8 and max length 15",
        });
    }
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    findUser.password = hash;
  }
 
  
  if (address) {
    address = parseJSONSafely(address)
       if (!isNaN(address) || !address) return res.status(400).send({ status: false, message: "Address should be in JSON Object Format look like this. {'key':'value'} and value can't be start with 0-zero" })
    if (!Object.keys(address).length) return res.status(400).send({ status: false, message: "Please mention either Shipping or Billing Address " })// I added this line here
   
    if (address.shipping) {

        //if (!Object.keys(address.shipping).length) return res.status(400).send({ status: false, message: "Please mention shipping (street||city||pincode)  " })// I added this line here 
        let { street, city, pincode } = address.shipping;

      if (address.shipping.hasOwnProperty("street")) {
            if (!isValidUserDetails(street)) return res.status(400).send({ status: false, message: "Shipping Street is invalid" })
            findUser.address.shipping.street = street;
          
                   }
        if (address.shipping.hasOwnProperty("city")) {
            if (!isValidUserDetails(city)) return res.status(400).send({ status: false, message: "Shipping city is invalid" })
            findUser.address.shipping.city = city;
         }
         if (address.shipping.hasOwnProperty("pincode")) {
            if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(pincode)) return res.status(400).send({ status: false, message: " Shipping pincode is invalid" })
            findUser.address.shipping.pincode = pincode;
        }
    }

    if (address.billing) {
        if (!Object.keys(address.billing).length) return res.status(400).send({ status: false, message: "Please mention Billing (street||city||pincode) " })// I added this line here
        let { street, city, pincode } = address.billing;
        if (address.billing.hasOwnProperty("street")) {
            if (!isValidUserDetails(street)) return res.status(400).send({ status: false, message: "billing street is invalid" })
            findUser.address.billing.street = street;
        }
        if (address.billing.hasOwnProperty("city")) {
            if (!isValidUserDetails(city)) return res.status(400).send({ status: false, message: "billing city is invalid" })
            findUser.address.billing.city = city;
         }
         if (address.billing.hasOwnProperty("pincode")) {
            if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(pincode)) return res.status(400).send({ status: false, message: " billing pincode is invalid" })
            findUser.address.billing.pincode = pincode;
        }
    }
}
 
  if (profileImage.length != 0) {
    if (!/\.(gif|jpe?g|tiff?|png|webp|bmp|jfif)$/i.test(profileImage[0].originalname)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "send profileimage in image formate only ex; gif,jpeg,png",
          });
      }
    const awsApi = async function (req, res) {
       
        if (profileImage && profileImage.length > 0) {
         
          let uploadedFileURL=await uploadFile(profileImage[0])
          return uploadedFileURL;
        } else {
          return res.status(400).send({ msg: "No file found" });
        }
    }
      findUser.profileImage = await awsApi()
    
  }

  req.findUser = findUser;

  next();
} catch (error) {
  res.status(500).send({ status: false, error: error.message });
}
};

module.exports = { updateValidation };
