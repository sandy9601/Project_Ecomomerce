const userModel = require("../models/userModel");
const {uploadFile}=require("../middlewares/aws")


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

let validName = /^[a-zA-Z ]{3,30}$/;
let validPass = /^[a-zA-Z0-9@*&]{8,15}$/;

const updateValidatior = async function (req, res, next) {

  let updateData = req.body;
  const { fname, lname, email, phone, password, address,} =
    updateData;
    let profileImage=req.files
  var final = {};
if(profileImage.length==0){
  if (Object.keys(updateData).length == 0) {
    return res
      .status(400)
      .send({ status: false, message: "Body Should Not Empty" });
  }}


  if (fname) {
    if (!isValid(fname) || !validName.test(fname)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "first Name is not given or invalid firstName",
        });
    }
    final.fname = fname;
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
    final.lname = lname;
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
    final.email = email;
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
    final.phone = phone;
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
    final.password = hash;
  }

  if (address) {
    var newAddress = JSON.parse(address);
    final.address = newAddress;
    //* streetValidation In shipping

    if (newAddress.shipping) {
      if (!isValid(newAddress.shipping.street)) {
        return res.status(400).send({
          status: false,
          message: "street is required in shipping address",
        });
      }
      if (!isValidUserDetails(newAddress.shipping.street)) {
        return res.status(400).send({
          status: false,
          message: `${newAddress.shipping.street} is inavlid formate for street in shipping address`,
        });
      }

      //* cityValidation in shipping
      if (!isValid(newAddress.shipping.city)) {
        return res.status(400).send({
          status: false,
          message: "city is required in shipping address",
        });
      }
      if (!isValidName(newAddress.shipping.city)) {
        return res.status(400).send({
          status: false,
          message: `${newAddress.shipping.city} is not a valid formate  for city in shipping address`,
        });
      }

      // * pincodeValidation

      if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(newAddress.shipping.pincode)) {
        return res.status(400).send({
          status: false,
          message: " enter valid pincode in number only in shipping address",
        });
      }
    }

    // * billingAddressValidation

    //* streetValidation in billing address
    if (newAddress.billing) {
      if (!isValid(newAddress.billing.street)) {
        return res.status(400).send({
          status: false,
          message: "street is required in  billing address",
        });
      }

      if (!isValidUserDetails(newAddress.billing.street)) {
        return res.status(400).send({
          status: false,
          message: `${newAddress.billing.street} is inavlid formate for street in billing address`,
        });
      }
    }

    //* cityValidation in billing address

    if (!isValid(newAddress.billing.city)) {
      return res.status(400).send({
        status: false,
        message: "city is required in billing address",
      });
    }
    if (!isValidName(newAddress.billing.city)) {
      return res.status(400).send({
        status: false,
        message: `${newAddress.billing.city} is not a valid formate  for city in billing address`,
      });
    }

    // * pincodeValidation in billing address

    if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(newAddress.billing.pincode)) {
      return res.status(400).send({
        status: false,
        message: " enter valid pincode in number only in billing address",
      });
    }
  }
 
  if (profileImage.length != 0) {
    if (!/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(profileImage[0].originalname)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "send profileimage in image formate only ex; gif,jpeg,png",
          });
      }
    const awsApi = async function (req, res) {
        //let files = profileImage;
    
        if (profileImage && profileImage.length > 0) {
         
          let uploadedFileURL=await uploadFile(profileImage[0])
          return uploadedFileURL;
        } else {
          return res.status(400).send({ msg: "No file found" });
        }
    }
      final.profileImage = await awsApi()
  }

  req.final = final;

  next();
};

module.exports = { updateValidatior };
