const mongoose = require('mongoose');
const helper = require('../helpers/validations');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const { Product, Inventory } = require('../models/productModels');
const Category = require('../models/categoryModel');
const path = require('node:path');
const sharp = require('sharp');




const loadProducts = asyncHandler(async (req, res) => {


    let products = await Product.find({})
        .sort({ createdAt: -1 });

    res
        .render('admin/adminProducts', {
            products
        });


})
const loadProductDetails = asyncHandler(async (req, res) => {

    let { id } = req.query;
    let product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: 'inventories',
                localField: '_id',
                foreignField: 'product',
                as: 'inventory'
            }
        },
        {
            $unwind: '$inventory'
        }




    ])
   
    console.log(product)

    // let category = await Category.findOne({ _id: product.category }).sort({createdAt: 1})

    // console.log(category)
    // console.log(category.title)
    // let { title } = category
    // product.category = title




    // console.log(product)

    res.render('admin/adminProductDetails', { product })

})
const loadAddProduct = asyncHandler(async (req, res) => {

    let category = await Category.find({
        isListed: true
    }).select('title -_id subCategories')
    console.log('category', category)

    res.render('admin/addProduct', { category });

})

const loadEditProduct = asyncHandler(async (req, res) => {
    let id = req.query.id;
    res.locals.productId = id; 

    let category = await Category.find({
        isListed: true
    }).select('title -_id subCategories')

    let product = await Product.findOne({ _id: id });
    console.log("product", product);
    res.render("admin/editProduct", { product ,category});



})

const addProductStock = asyncHandler(async (req, res, next) => {
    try {

        let { id, size, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400)
                .json({
                    success: false,
                    error: true,
                    message: 'Quantity can\'t be less than 1'
                })
        }
        let inventory = await Inventory.findOne({ product: id });       
        let totalStock = inventory.sizeVariant?.reduce((acc, item) => item.stock + acc, 0)
        if (inventory) {
            const existSizeVariant = inventory.sizeVariant.find(variant => variant.size === size);
         
            if (existSizeVariant) {
                existSizeVariant.stock += parseInt(quantity);
                await existSizeVariant.save();
                
                inventory.totalStock = totalStock + parseInt(quantity)

            } else {
                inventory.sizeVariant.push({
                    size: size,
                    stock: parseInt(quantity)
                });
                inventory.totalStock = totalStock + parseInt(quantity)
            }
            inventory = await inventory.save();
            res.status(200)
                .json({
                    success: true,
                    error: false,
                    message: 'Stock added successfully'
                });
        } else {
            inventory = await Inventory.create({
                product: id,
                totalStock: parseInt(quantity),
                sizeVariant: [{
                    size: size,
                    stock: parseInt(quantity),
                }]
            });
            console.log("Created successfully");
            res
                .status(201)
                .json({
                    success: true,
                    error: null,
                    message: 'Inventory added successfully'
                });
        }

    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            error: error.message,
            message: 'Something went wrong'
        });

    }

})

const addProduct = asyncHandler(async (req, res, next) => {
    let { title, mrpPrice, description, price, category , color} = req.body;
    category = category.map(item => item.split(',')).map(item => {
       return  {[item[0]] : item[1]}
    })
    let images = req.files.map(item => item.filename);
    let cropPath = path.join(__dirname, '../../public/Data/sharped');
    let { error, value } = helper.productValidation.validate({
        title, mrpPrice, description, price,
    });
    images.forEach((item, index) => {

        sharp(req.files[index].path).resize(600, 600).toFile(`${cropPath}/${item}`)
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.log(error);
            })
    })
    let product = await Product.create({
        title,
        mrpPrice,
        description,
        price,
        category,
        images,
        color
    });
    await Inventory.create({
        product: product._id
    })
    res.redirect('/api/v1/admin/products');


})

const editProduct = asyncHandler(async (req, res, next) => {
    let { title, mrpPrice, description, price, color, category, imageIndexes, id } = req.body;
    
    category = Array.from(category).map(item => item.split(',')).map(item => {
        return  {[item[0]] : item[1]}
     })

    let images = req.files?.map(item => item.filename);
    let cropPath = path.join(__dirname, '/../public/Data/sharped');


    images?.forEach((item, index) => {
        sharp(req.files[index].path).resize(600, 600).toFile(`${cropPath}/${item}`)
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.log(error);
            })
    })
   
    console.log(Array.from(imageIndexes), 'array indexes')

    Array.from(imageIndexes)?.forEach(async (item, index) => {
        await Product.updateOne({
            _id: id
        },
        {
            $set: {
                [`images.${item}`]: images[index]
            }
        }
    )
        

    })
    
    

    let product = await Product.findOneAndUpdate({
        _id: id
    }, {
        $set:
        {       
            title,
            mrpPrice,
            description,
            price,
            color,
            category
        }
    },
    {
        new: true
    }

);
console.log(product);
    
    return res.status(201)
        .json({
            success: true,
            error: false,
            data: product,
            message: 'Product edited Successfully'
        })


})

const listUnlistProduct = (req, res, next) => {
    const { id } = req.body
    console.log(id)


    return Product.findOne({ _id: id })
        .then((category) => {
            if (category.isListed) {


                return Product.updateOne({ _id: id },
                    {
                        $set: {
                            isListed: false
                        }
                    })
                    .then(() => {
                        res.json({ ok: true })
                    })

            } else {

                return Product.updateOne(
                    { _id: id },
                    {
                        $set:
                            { isListed: true }
                    }
                )
                    .then(() => {
                        res.json({ ok: true });
                    }).catch((error) => {
                        console.log(error)
                    })


            }

        })




}




module.exports = {
    loadProducts,
    loadAddProduct,
    loadEditProduct,
    loadProductDetails,
    addProduct,
    editProduct,
    addProductStock,
    listUnlistProduct


}

