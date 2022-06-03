const express = require('express')
const router = express.Router()
const { authentication,authorization } = require("../middleware/auth")
const { registerUser, userLogin,getProfileData,updateUserDetails } = require("../controllers/userController")
const {createProduct,getProduct,getProductById,updateProductDetails,deleteProduct} = require("../controllers/productController")
const {createCart,removeProduct,getCart,deleteCart} = require("../controllers/cartController")
const {createOrder, updateOrder} = require('../controllers/orderController')

//---USER APIS---//
//==Register User
router.post('/register', registerUser)

//==Login User
router.post('/login', userLogin) 

//==Get User
router.get('/user/:userId/profile',authentication, authorization, getProfileData) /////////

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

//==Delete Product Document
router.delete('/products/:productId', deleteProduct)

//*******************************************************************//

//---CART APIS---//
//==Create Cart/Add Product to Cart 
router.post('/users/:userId/cart',authentication,authorization,createCart)

//==Remove Product from Cart
router.put('/users/:userId/cart',authentication,authorization,removeProduct)

//==Get Cart
router.get('/users/:userId/cart',authentication,authorization,getCart)

//==Delete Cart
router.delete('/users/:userId/cart',authentication,authorization,deleteCart)


//*******************************************************************//

//---Order APIS---//
//==Create Order
router.post('/users/:userId/orders',authentication,authorization,createOrder)

//==Update Order
router.put('/users/:userId/orders',authentication,authorization,updateOrder)


//**********************************************************************
module.exports = router  

//*******************************************************************//
