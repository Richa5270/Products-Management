const jwt = require("jsonwebtoken")
const { isValidObjectId } = require("mongoose")
const userModel = require("../models/userModel")


let authentication = function (req, res, next) {
    try {
        let token = req.header('Authorization','Bearer Token')
  
        if (!token) return res.status(400).send({ status: false, message: "Token is required" })
    
        let decodedToken = jwt.verify(token.split(" ")[1], "Group 24 project",(err, decoded) => {    
        if (!decoded) {
        return res.status(401).send({ status: false, message: "Invalid token", err: err.message })
        } else {
        req.userId = decoded.userId
        next();
    }
    });
    } catch (err) {
        return res.status(500).send({ status: false,  message: err.message })
    }
}

//**********************************************************************//

const authorization = async function (req, res, next) {
    try {
        let tokenId = req.userId;
        let user = req.params.userId

        if (!isValidObjectId(user)) return res.status(400).send({status:false,message:`User id ${user} is invalid`})

        const findUser= await userModel.findOne({_id:user});
        if (!findUser) return res.status(404).send({ status: false, message: 'User not found' })
        const {_id} = findUser;

        if(tokenId.toString()!==_id.toString()) return res.status(403).send({ status: false, message: "Unauthorized, cannot access other's data." })
        next()
    }catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//**********************************************************************//

 module.exports = { authentication ,authorization}

//**********************************************************************//
