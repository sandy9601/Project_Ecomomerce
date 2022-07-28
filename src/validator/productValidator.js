const productModel = require("../models/productModel");

const isValid = function (value) {
  if (typeof value !== "string" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidUserDetails = (UserDetails) => {
  if (/^(?=.*?[a-zA-Z])[. %?a-zA-Z\d ]+$/.test(UserDetails)) return true;
};

const isValidName = (name) => {
  if (/^[ a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name)) return true;
};


const productValidator = async function (req, res, next) {
  try {
    let data = req.body;
    var {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments,
      deletedAt,
      isDeleted,
    } = data;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Body couldnot be empty" });
    }

// * title validation
      
if (!isValid(title)) {
    return res
      .status(400)
      .send({ status: false, message: "title is required" });
  }

  if (!isValidUserDetails(title)) {
    return res.status(400).send({
      status: false,
      message: `${title} is not a valid formate  for title`,
    });
  }
  const titleCheck=await productModel.findOne({title:title})
  if(titleCheck){
    return res.status(400).send({status:false,messsage:`title ${title} is already used try another one`})
  }


// * description validation

    if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, message: "description is required" });
      }
      if (!isValidUserDetails(description)) {
        return res.status(400).send({
          status: false,
          message: `${description} is not a valid formate  for description`,
        });
      }


      // * price validation

if(!price||price==""){
    return res.status(400).send({status:false,message:"price is required"})
}
      if (price){
      if(!/^[1-9]\d{0,7}(?:\.\d{1,4})?|\.\d{1,4}$/.test(price)){
        return res
           .status(400)
      .send({ status: false, message: "price formate is not correct" })
      }
    }

// * currencyId validation

 if (currencyId){
 if(currencyId!="INR") {
    return res
      .status(400)
      .send({ status: false, message: "currencyId formate is not correct" });
  }}
  else{
    data.currencyId="INR"
  }
  
  // * currencyId validation

  if (currencyFormat){
  if(currencyFormat!="₹") {
     return res
       .status(400)
       .send({ status: false, message: "currencyFormat formate is not correct" });
   }}
   else{
     data.currencyFormat="₹"
   }
 
   if (isFreeShipping)
   if(!["true","false"].includes(isFreeShipping)) {
      return res
        .status(400)
        .send({ status: false, message: "isFreeShipping formate is not correct" });
   }

   
    // * styleValidation
if(style){
      if (!isValidUserDetails(style)) {
        return res.status(400).send({
          status: false,
          message: `${style} is not a valid formate  for style`,
        });
      }
    }
 
    // * availableSizesValidation

    if(!availableSizes||availableSizes==""){
        return res.status(400).send({status:false,message:"availableSizes is required"})
    }

    if (availableSizes) {
        let array = availableSizes.split(",").map(x => x.toUpperCase().trim())
        for (let i = 0; i < array.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i].trim()))) {
                return res.status(400).send({ status: false, message: 'Sizes only available from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
            }
           
        }
        if (Array.isArray(array)) {
            let uniqeSize = new Set(array)
          let result = [...uniqeSize]

            data.availableSizes=result

        }
    }

    
    if(installments){
        if(!/^[0-9]+$/.test(installments))
        return res.status(400).send({status:false,message:"installments will only consist number"})
    }


    if(deletedAt){
        if(deletedAt!='null')
        return res.status(400).send({status:false,message:"deletedAt is not required at the moment"})

    }

    if(isDeleted){
        if(isDeleted!='false')
        return res.status(400).send({status:false,message:"isDeleted is false by defualt"})

    }


next()


  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports={productValidator}