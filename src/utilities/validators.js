const ObjectId = require("mongoose").Types.ObjectId


//**********************************************************************//

//==Request Body Validation
let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}
//**********************************************************************//

//==Mandatory Field Validation
let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}
//**********************************************************************//

//==ObjectId Validation
let isValidObjectId = function (objectId) {
    if (!ObjectId.isValid(objectId)) return false;
    return true;
}
//**********************************************************************//

//==Email Validation
let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}
//**********************************************************************//

//==Mobile Number Validation
let isValidMobile = function (phone) {
    let mobileRegex =/^[6-9]\d{9}$/;
    return mobileRegex.test(phone);  //^\d{10}$/
}
//**********************************************************************//
//==Name Validation
let isValidName=function(name){
    let nameRegex=/^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/;
    return nameRegex.test(name);
    }
 //**********************************************************************//
    
//==Password Validation
 let isValidPassword=function(password){
    let regexPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
    return regexPassword.test(password);
    }
//*******************************************************************//

//==Price Validation
let isValidPrice=function(price){
    let priceRegex=/^(\d+(\.\d+)?)$/;
    return priceRegex.test(price);
    }
//^\d+(?:\.\d{1,4})?$/
//*******************************************************************//

//==Enum Validation
let isValidEnum= function(value){
    let availableSizes=["S", "XS","M","X", "L","XXL", "XL"];
 // return  enums.indexOf(value)!== -1;
 return  availableSizes.includes(value)
}
//*******************************************************************//

//==Number Validation
const isValidNum = (number) => {
    if (/^\d+$/.test(number)) {
      return true
    } else {
      return false;
    };
  };
//*******************************************************************//

//==File Validation
const isValidFile = function(files){
    let imageRegex = /.*\.(jpeg|jpg|png)$/;
    return imageRegex.test(files)
}

//*******************************************************************//

const isValidStatus = (status) => {
    let correctStatus = ['pending', 'completed', 'cancled']
    return (correctStatus.includes(status))
  }
//************************************************************************ */
  const isValidSize = (Size) => {
    let correctSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    return (correctSize.includes(Size))
  }
  

    module.exports = { isValidStatus, isValidSize, isValidRequestBody,isValidNum,isValidFile, isValid, isValidObjectId, isValidEmail, isValidMobile, isValidName, isValidPassword,isValidPrice,isValidEnum }

//*****************************************************************//
