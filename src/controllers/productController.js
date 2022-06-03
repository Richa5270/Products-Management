const productModel = require("../models/productModel")
const aws = require("../utilities/aws")
const { isValidRequestBody, isValidNum,isValidSize, isValid, isValidPrice, isValidEnum, isValidObjectId, isValidName, isValidFile } = require("../utilities/validators");


//---CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        //==validating request body==//
        let data = req.body;
        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: 'No data provided' })

        //==validating files==//
        let files = req.files;
        if (files.length == 0) return res.status(400).send({ status: false, message: "Please provide a product image" })
        if (!isValidFile(files[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image only" })

        //==validating title==//
        if (!(isValid(data.title))) return res.status(400).send({ status: false, message: "Title is required" })
        data.title = data.title.toUpperCase()
        let uniqueTitle = await productModel.findOne({ title: data.title })
        if (uniqueTitle) { return res.status(400).send({ status: false, message: 'Title already exist. Please provide a unique title.' }) }

        //==validating description==//
        if (!(isValid(data.description))) return res.status(400).send({ status: false, message: "Description is required" })

        //==validating price==//    
        if (!(isValid(data.price))) return res.status(400).send({ status: false, message: "Price is required" })
        if (!(isValidPrice(data.price))) return res.status(400).send({ status: false, message: `${data.price} is not a valid price. Please provide input in numbers.` })

        //==validating currencyId==//
        if (!(isValid(data.currencyId))) return res.status(400).send({ status: false, message: "Currency Id is required" })
        if (data.currencyId.trim() !== "INR") return res.status(400).send({ status: false, message: "Please provide Indian Currency Id" })

        //==validating currencyFormat==//
        if (!(isValid(data.currencyFormat))) return res.status(400).send({ status: false, message: "Currency Format is required" })
        if (data.currencyFormat.trim() !== "₹") return res.status(400).send({ status: false, message: "Please provide right format for currency" })

        //==validating style==//
        if (!(isValid(data.style))) return res.status(400).send({ status: false, message: "Please provide style for your product" })

        //==validating availableSizes==//
        if (!(isValid(data.availableSizes))) return res.status(400).send({ status: false, message: "Please provide available size for your product1" })

        if (data.availableSizes.toUpperCase().trim().split(',').map(value => isValidEnum(value)).filter(item => item == false).length !== 0) return res.status(400).send({ status: false, message: 'Size should be among [S, XS, M, X, L, XXL, XL] ' })

        const availableSizes = data.availableSizes.toUpperCase().trim().split(',').map(value => value.trim()); //converting in array
        data.availableSizes = availableSizes

        //==validating installments==//
        if (!(isValid(data.installments))) return res.status(400).send({ status: false, message: 'Please provide installments for your product' })

        //==uploading product picture==//  
        const uploadedFileURL = await aws.uploadFile(files[0])
        data.productImage = uploadedFileURL;

        //==creating and sending product details==//
        const newData = await productModel.create(data);
        return res.status(201).send({ status: true, message: 'Product created successfully', data: newData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

//*******************************************************************//

//---GET PRODUCT (all or filter)
const getProduct = async function (req, res) {
    try {
        const requestQuery = req.query
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = requestQuery
        const filterQuery = { isDeleted: false }

        if (Object.keys(requestQuery).length > 0) {
            if (size) {
                let size1 = size.split(",").map(x => x.trim().toUpperCase())
                if (size1.map(x => isValidSize(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be among  S,XS,M,X,L,XXL,XL" })
                filterQuery.availableSizes = { $in: size1 }
            }

            if (name) {
                let findTitle = await productModel.find()
                let fTitle = findTitle.map(x => x.title).filter(x => x.includes(name))

                if (fTitle.length == 0) { filterQuery.title = name }
                filterQuery.title = { $in: fTitle }
            }

            if (priceSort){
                if(priceSort != 1 && priceSort != -1 ) return res.status(400).send({ status: false, message: "priceSort should be among 1 and -1." })
            }

            if (priceGreaterThan && priceLessThan) { filterQuery.price = { $gt: priceGreaterThan, $lt: priceLessThan } }
            if (priceGreaterThan && !priceLessThan) { filterQuery.price = { $gt: priceGreaterThan } }
            if (priceLessThan && !priceGreaterThan) { filterQuery.price = { $lt: priceLessThan } }
        }

        const findProducts = await productModel.find(filterQuery).sort({ price: priceSort })

        if (findProducts.length == 0) return res.status(404).send({ status: false, message: "products not found or may be deleted" })

        return res.status(200).send({ status: true, message: "products list", data: findProducts })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//*******************************************************************//

//---GET PRODUCT BY ID
const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        //==validating productId==//
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId  is not a valid product id" })

        //==finding product==//    
        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null })
        if (!product) return res.status(404).send({ status: false, message: "Product not found" })

        //==sending response==//
        return res.status(200).send({ status: true, message: "Product Details", data: product })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//*******************************************************************//

//---UPDATING PRODUCT
const updateProductDetails = async function (req, res) {
    try {
        const productId = req.params.productId
        const image = req.files
        let updateData = req.body

        //==validating productId==//
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "invalid user Id" })

        //==finding product by productId==//
        let findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(404).send({ status: false, msg: "Product not found" })

        //==validating request body==//
        if (!isValidRequestBody(updateData)) return res.status(400).send({ status: false, msg: "please provide data to update" })
        let { title, description, price, style, availableSizes, installments } = updateData

        //==validating & uploading image if given==//
        if (image && image.length > 0) {
            if (!isValidFile(image[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image only" })
            let updateProductImage = await aws.uploadFile(image[0])
            updateData.productImage = updateProductImage
        }

        //==validating title if given==//
        if (title == "") { return res.status(400).send({ status: false, message: "title is not valid" }) }
        else if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title is not valid" })

            updateData.title = updateData.title.toUpperCase()
            if (await productModel.findOne({ title: updateData.title.toUpperCase() })) return res.status(400).send({ status: false, message: "title Should be Unique" })
        }

        //==validating description if given==//
        if (description == "") { return res.status(400).send({ status: false, message: "description is not valid" }) }
        else if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description Should be Valid" })
        }

        //==validating price if given==//
        if (price == "") { return res.status(400).send({ status: false, message: "price is not valid" }) }
        else if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be Valid" })
        }

        //==validating style if given==//      
        if (style == "") { return res.status(400).send({ status: false, message: "style is not valid" }) }
        else if (style) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "style Should be Valid" })
            if (!isValidName(style)) return res.status(400).send({ status: false, message: "style Should Not Contain Numbers" })
        }

        //==validating availableSizes if given==// 
        if (availableSizes == "") { return res.status(400).send({ status: false, message: "availableSizes is not valid" }) }
        else if (availableSizes) {
            if (updateData.availableSizes.toUpperCase().trim().split(',').map(value => isValidEnum(value)).filter(item => item == false).length !== 0) { return res.status(400).send({ status: false, message: 'Size Should be Among  S,XS,M,X,L,XXL,XL' }) }
            const availableSizes = updateData.availableSizes.toUpperCase().trim().split(',').map(value => value.trim());
            updateData.availableSizes = availableSizes
        }

        //==validating installments if given==// 
        if (installments == "") { return res.status(400).send({ status: false, message: "installments is not valid" }) }
        else if (installments) {
            if (!isValidNum(installments)) return res.status(400).send({ status: false, message: "installments Should be whole Number Only" })
        }


        //==updating and sending data==//     
        const updateDetails = await productModel.findByIdAndUpdate({ _id: productId }, updateData, { new: true })
        return res.status(200).send({ status: true, message: "Product updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//*******************************************************************//

//---DELETE PRODUCT
const deleteProduct = async function (req, res) {
    try {
        //==validating productId==//    
        let id = req.params.productId
        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, msg: "ProductId is invalid" })
        }
        const checkId = await productModel.findById({ _id: id })

        if (!checkId)
            return res.status(400).send({ status: false, msg: " This productId does not exist" })

        if (checkId.isDeleted == true)
            return res.status(400).send({ status: false, msg: " This Product is already deleted" })

        //==deleting product by productId==// 
        const deletedProduct = await productModel.findByIdAndUpdate({ _id: id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true })
        return res.status(200).send({ status: true, msg: "successfully deleted" })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err })
    }
}

//*******************************************************************//

module.exports = { createProduct, getProduct, getProductById, deleteProduct, updateProductDetails }

//*******************************************************************//