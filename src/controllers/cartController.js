const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")

const createCart = async function(req,res){
    const data = req.body
    const userid = req.params.userId
   // var{userId,items,totalPrice,totalItems}=data
    data.userId= userid
    var arr =[]
    var quantity=[] 
    var totalPrice=0
    for(let i=0;i<data.items.length;i++){
        arr.push(data.items[i].productId)
        quantity.push(data.items[i].quantity)
    } 
    const productData = await productModel.find({_id:{$in:arr}})
    for(let i=0;i<productData.length;i++){
        totalPrice+=productData[i].price*quantity[i]
    } 
    data.totalItems=data.items.length
    data.totalPrice=totalPrice
    console.log(data)

    const findCartByUserId = await cartModel.findById(userid)
    if(!findCartByUserId){
        const createNewCart = await cartModel.create(data)
        return res.status(201).send({ status:true,message:"Success",data:createNewCart })
    }

}

module.exports={createCart}