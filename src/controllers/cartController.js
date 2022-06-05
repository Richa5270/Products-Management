const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const { isValidRequestBody,isValidNum, isValid,isValidObjectId} = require("../utilities/validators");



//---CREATING CART
const createCart = async function(req, res){
  try{
      let userId = req.params.userId
      let reqBody = req.body
      
    //==validating userId==//
      if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message:"userId  is invalid." })
      let findUserId = await userModel.findById({ _id: userId })
      if (!findUserId) return res.status(404).send({ status: false, msg: "user not found" })
   
    //==validating request body==//
      if(!isValidRequestBody(reqBody))  return res.status(400).send({ status: false, message: 'No data provided' })
      let {productId, quantity } = reqBody
      let data = { userId }
      quantity = 1
      
    //==validating productId==//
      if (!(isValid(productId)))  return res.status(400).send({ status: false, message: "productId Id is required" })
      if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message:"productId  is invalid" })
   
    //==validating quantity==//  
      // if (!(isValid(quantity)))  return res.status(400).send({ status: false, message: "quantity is required" })
      // if(!isValidNum(quantity)) return res.status(400).send({ status: false, message:"Please provide number only." })
      data["items"] = [{productId,quantity}]
      
    //==finding product by productId==//
      let getProduct = await productModel.findById({ _id : productId}) 
      if(getProduct == null) return  res.status(404).send({ status: false, message:"Product Not Found." })
      productPrice = getProduct.price
    
    //==checking if cart present ==//
      let presentCart = await cartModel.findOne({userId :userId})
  
    if(presentCart!== null){
  //==if cart present updating it:

    //==calculating total price and total items==//
      presentCart.totalPrice += (productPrice*quantity)
      data.totalPrice = presentCart.totalPrice
     
      let newData=[]
      let index = 0
      let product = 0
      let number = 0
      for(let i = 0; i<presentCart.items.length;i++){
        if(presentCart.items[i].productId == productId){
          index = i
          product = presentCart.items[i].productId.toString()
          number = presentCart.items[i].quantity
        } else{
          newData.push(presentCart.items[i])
        }
      }
      
    if(product == 0){
  //==if product not present in cart:
    //==updating cart==//
        presentCart.totalItems += 1
        data.totalItems = presentCart.totalItems
        let updateCart = await cartModel.findOneAndUpdate(
        {_id : presentCart._id},
        {
        userId : data.userId,
        $addToSet : {items: data.items},
        totalPrice : data.totalPrice,
        totalItems : data.totalItems
        },
        { new: true })
    //==sending updated cart==//
        return res.status(200).send({ status: true, message: 'Item added successfully', data: updateCart })
        } 
    else if(product !== 0){
  //==if product present in cart:
      data.totalItems = presentCart.totalItems
      presentCart.items[index].quantity= number + quantity
      newData.push(presentCart.items[index])  
      data.items =  newData
      
      //==updating cart==//
          let updateCart = await cartModel.findOneAndUpdate(
          {_id : presentCart._id},
          {
          $set : {items: data.items}, 
          totalPrice : data.totalPrice,
          totalItems : data.totalItems
          },
          { new: true })
    
      //==sending updated cart==//
          return res.status(200).send({ status: true, message: 'Item added successfully', data: updateCart })
        }
  }else{
  //==if cart not present creating it:
    //==calculating price and quantity==//
      let totalPrice = quantity * productPrice
      data.totalPrice = totalPrice
      let totalItems = quantity
      data.totalItems = totalItems
    //==creating new cart==//
      let cartCreated = await cartModel.create(
        { 
      userId : data.userId,
      items: data.items,
      totalPrice : data.totalPrice,
      totalItems : data.totalItems
      }
      )
   
    //==sending new cart in response==//
      return res.status(201).send({ status: true, message: 'Cart created successfully', data: cartCreated })
    }
   }catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
  }
//*******************************************************************//

//---REMOVE PRODUCT FROM CART
const removeProduct = async function(req,res){
  try{
  let userId = req.params.userId
  let reqBody = req.body
  
//==validating userId==//
  if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message:"userId  is invalid." })
  let findUserId = await userModel.findById({ _id: userId })
  if (!findUserId) return res.status(404).send({ status: false, msg: "user not found" })

//==validating request body==//
  if(!isValidRequestBody(reqBody))  return res.status(400).send({ status: false, message: 'No data provided' })
  let {productId,removeProduct,cartId} = reqBody
  let data = { userId }
  
//==validating productId==//
  if (!isValid(productId))  return res.status(400).send({ status: false, message: "productId Id is required" })
  if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message:"productId  is not a valid id" })

//==validating cartId==//
  if (!isValid(cartId))  return res.status(400).send({ status: false, message: "cartId Id is required" })
  if(!isValidObjectId(cartId)) return res.status(400).send({ status: false, message:"cartId  is not a valid id" })

//==validating removeProduct==//   
  if (!isValid(removeProduct))  return res.status(400).send({ status: false, message: "removeProduct is required" })
  if(removeProduct !== 0 && removeProduct !== 1) return res.status(400).send({ status: false, message:"Please provide number among 0 & 1." })

//==checking product is present or not in product model==//
  let getProduct = await productModel.findById({ _id : productId}) 
  if(getProduct == null) return  res.status(404).send({ status: false, message:"Product Not Found." })
  productPrice = getProduct.price
  
//==checking cart is present or not in cart model==//
  let presentCart = await cartModel.findOne({userId : userId})
  if(presentCart == null) return  res.status(404).send({ status: false, message:"Cart Not Found. First create cart." })
  if(cartId.toString() !== presentCart._id.toString() ) return  res.status(400).send({ status: false, message:"Please provide your cartId." })
  //cartId = presentCart._id

//==checking product is present or not in cart==//
data["items"] = []
let index = 0
let product = 0
let number = 0
for(let i = 0; i<presentCart.items.length;i++){
  if(presentCart.items[i].productId == productId){
       index = i
       product = presentCart.items[i].productId.toString()
       number = presentCart.items[i].quantity
  }else{
  data["items"].push(presentCart.items[i])
}
}
if(product === 0) return res.status(404).send({ status: false, message:"Product Not in cart." })

//==removing complete product from cart:
if(removeProduct === 0){
//==calculating total price and items==//
  presentCart.totalPrice -= productPrice * number
  data.totalPrice = presentCart.totalPrice
  presentCart.totalItems -= 1
  data.totalItems = presentCart.totalItems

//==updating cart==//
  let removeItem = await cartModel.findOneAndUpdate(
    {_id : cartId},
    {
    $set : {items : data.items},
    totalPrice : data.totalPrice,
    totalItems : data.totalItems},
    { new : true})
   return res.status(200).send({ status: true, message: 'product removed successfully', data: removeItem })

} 
//==decreasing quantity of product by 1:
else if (removeProduct === 1){
//==calculating total price and items==//
  presentCart.totalPrice -= productPrice * 1
  data.totalPrice = presentCart.totalPrice
  data.totalItems = presentCart.totalItems
  presentCart.items[index].quantity -= 1
  data["items"] = presentCart.items

if(presentCart.items[index].quantity!==0){
//== after removing, quantity is still >0(minimum one present):
//==updating cart==//
  let removeItem = await cartModel.findOneAndUpdate(
    {_id : cartId},
    {
    $set : {items : data.items},
    totalPrice : data.totalPrice,
    totalItems : data.totalItems},
    { new : true})
    return res.status(200).send({ status: true, message: 'product removed successfully', data: removeItem })
  }else{
  //== after removing, quantity is 0(remove complete object):
    data["items"] =[]
    for(let i = 0; i<presentCart.items.length;i++){
       if(i !== index){
        data["items"].push(presentCart.items[i])
       }
    }

    presentCart.totalItems -= 1
    data.totalItems = presentCart.totalItems

    let removeItem = await cartModel.findOneAndUpdate(
      {_id : cartId},
      {
      $set : {items : data.items},
      totalPrice : data.totalPrice,
      totalItems : data.totalItems},
      { new : true})
      return res.status(200).send({ status: true, message: 'product removed successfully', data: removeItem })
    }
  }
 }catch (error) {
  return res.status(500).send({ status: false, msg: error.message })
 }
}
//*******************************************************************//
const getCart = async function (req, res) {
  try {
      const userId = req.params.userId
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

      const getUser = await userModel.findOne({_id : userId })
      if (!getUser) return res.status(404).send({ status: false, message: "User not found" })
      
      const getData = await cartModel.findOne({ userId: userId  })
      //.populate("items.productId")
      if (!getData) return res.status(404).send({ status: false, message: "Cart not found" })

      return res.status(200).send({ status: true, message: "cart details", data: getData })
  }
  catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  }
}

//*******************************************************************//

const deleteCart = async function (req, res) {
  try {
      let userId = req.params.userId

      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })

      const userExist = await userModel.findById({_id: userId})
      if(! userExist) return res.status(404).send({ status: false, message: "user not found.." })

      const isCartExist = await cartModel.findOne({ userId: userId })
      if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist..." })

      const cartDeleted = await cartModel.findOneAndUpdate({ _id: isCartExist._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
      return res.status(200).send({ status: true, message: "your cart is empty..continue shopping", data: cartDeleted })
  }
  catch (err) {
      return res.status(500).send({ status: false, error: err.message })
  }
}


//*******************************************************************//

module.exports = {createCart,removeProduct,getCart,deleteCart}

//*******************************************************************//









































































