const express = require('express')
const router = express.Router()
const { authentication,authorization } = require("../middleware/auth")
const { registerUser, userLogin,getProfileData,updateUserDetails } = require("../controllers/userController")
const {createProduct,getProduct,getProductById,updateProductDetails,deleteProduct} = require("../controllers/productController")
const {createCart,removeProduct,getCart,deleteCart} = require("../controllers/cartController")


//---USER APIS---//
//==Register User
router.post('/register', registerUser)

//==Login User
router.post('/login', userLogin) 

//==Get User
router.get('/user/:userId/profile',authentication, getProfileData) 

//==Updating User Document
router.put('/user/:userId/profile', authentication,authorization, updateUserDetails) 

//*******************************************************************//

//---PRODUCT APIS---//
//==Create Poduct Document
router.post('/products', createProduct)

//==Get Product Document(all or filter)
router.get('/products', getProduct)

//==Get Product by Id
router.get('/products/:productId', getProductById)

//==Update Product Document
router.put('/products/:productId', updateProductDetails)

//==dDlete Product Document
router.delete('/products/:productId', deleteProduct)

//*******************************************************************//

//---CART APIS---//
//==Create Cart/Add Product to Cart 
router.post('/users/:userId/cart',authentication,authorization,createCart)

//==Remove Product from Cart
router.put('/users/:userId/cart',authentication,authorization,removeProduct)

//==Get Cart
router.get('/users/:userId/cart',getCart)

//==Delete Cart
router.delete('/users/:userId/cart',deleteCart)

//*******************************************************************//
const { createOrder, updateOrder} = require('../controllers/orderController')

router.post('/users/:userId/orders', createOrder)
router.put('/users/:userId/orders', updateOrder)

//**********************************************************************
module.exports = router  

//*******************************************************************//