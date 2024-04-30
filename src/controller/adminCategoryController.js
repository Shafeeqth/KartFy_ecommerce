const helper = require('../helpers/validations');
const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const Category = require('../models/categoryModel');





const loadCategories = asyncHandler(async (req, res) => {

    
    const categories = await Category.find({}).sort({createdAt:-1});
    res
    .render('admin/Catagery', { 
        categories 
    });



})


const loadAddCategory = asyncHandler(async (req, res) => {
    res.render('admin/addCategory',{title: 'Add Category'})

})




const loadEditCategory = asyncHandler(async (req, res, next) => {
    let id = req.query.id;
    if (!id) return res.json({ error: true, success: false, message: 'something went wrong' })


    let category = await Category.findById({ _id: id })
    res.render('admin/editCategory', { category })


})
const loadAddSubCategory = asyncHandler(async (req, res) => {

    res.render('admin/addSubCategory', { title: 'Sub Category' })
})

const loadEditSubCategory = asyncHandler(async (req, res) => {
    console.log('laod edit subcategory')
    let { id, subId } = req.query;
    console.log(req.query)

    let category = await Category.findOne({ _id: id });
    let subCategory = category.subCategories.find(item => item._id.toString() == subId)




    console.log(subCategory, 'sub category')
    res.render('admin/editSubCategory', { title: 'Edit subCategory', subCategory, id })
})

const loadSubCategories = asyncHandler(async (req, res) => {

    let id = req.query.id;
    req.session.categoryId = id;
    let category = await Category.findOne({ _id: id });
    console.log(category);

    res.render('admin/subCategories', { category, title: 'Sub Cateries', })

})

const addCategory = asyncHandler(async (req, res, next) => {

    let { title, description } = req.body;
    let { error, value } = helper.cagetoryValidation.validate({
        title, description
    });
    console.log(error || value)

    if (!error) {

        
            let alreadyCategory = await Category.findOne({
                title: {
                    $regex: title, $options: 'i'
                }
            });

            if (alreadyCategory) {



                return res
                    .json({
                        fail: true
                    });


            } else if (title) {
                const category = new Category({
                    title, description
                });
                return category.save()
                    .then((saved) => {
                        console.log('this is saved ', saved)
                        if (saved) {
                            res
                                .json({
                                    saved: true
                                });
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } else {
                console.log('data not recieved');
            }

        
        


    } else {

    }

})

const listUnlistCategory = (req, res, next) => {
    const { id } = req.body
    console.log(id)


    return Category.findOne({ _id: id })
        .then((category) => {
            if (category.isListed) {


                return Category.updateOne({ _id: id },
                    {
                        $set: {
                            isListed: false
                        }
                    })
                    .then(() => {
                        res.json({ ok: true })
                    })

            } else {

                return Category.updateOne(
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

                    });


            }

        })




}

const submitEditCategory = asyncHandler(async (req, res, next) => {
    console.log(req.body, 'body')

    let { title, description, id } = req.body;
    console.log(title, description, id)


    
        let category = await Category.findOne({

            $and:

                [{ title: {$regex: `^${title}$`, $options:'i'} }, { _id: { $ne: id } }]

        });

        console.log(category)

        if (category) res.json({
            error: true,
             fail: true,
              message: 'Same Category already exist!'
            })
 
           
                await Category.updateOne({

                    _id: id
                }, {
                    $set: { title, description }
                });

                return res.json({ saved: true })

            
       

    

})



const editSubCategory = asyncHandler(async (req, res, next) => {
    console.log(req.body, 'body')

    let { title, description, catId, subId } = req.body;
    console.log( title, description, catId, subId)


    
        let category = await Category.findOne({
            _id: catId

            // $and:

            //     [{ title: {$regex: `^${title}$`, $options:'i'} }, { _id: { $ne: id } }]

        });

        console.log(category)

        if (!category) res.status(400)
            .json({
            error: true,
             fail: true,
              message: 'Category not Exist!'
            })

        let subCategoryExist =  category.subCategories.find(item => {
            if (title.toLowerCase()  === item.title.toString().toLowerCase() && 
            item._id != subId
        ) {
                return true
           
        }
})
        if( subCategoryExist) {
            return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Same title name already exist'
            
            })
        }

       let result =  await Category.findOneAndUpdate({ 
            _id: catId, 'subCategories._id': subId
        },
        {
            'subCategories.$.title': title,
            'subCategories.$.description' : description 
            

        },
    {
       new: true 
    })
        return res
            .status(200)
            .json({
                success: true,
                error: null,
                data : result,
                message: 'SubCategory edited Succesfulyy'

            })  

            
       

    

})

const addSubCategory = asyncHandler(async (req, res, next) => {
    
    let { title, description } = req.body;
    let id = req.session.categoryId;
    console.log('title: ', title, 'description: ', description);
    console.log(id, 'categoryId')
    req.session.categoryId = undefined;

    let match = await Category.findOne({
        _id: id,
        "subCategories.title": {
             $regex: `^${title}$`, $options: 'i' 
            }
    }).sort({})

    if (match) {
        return res.json({
            success: false,
            error: true,
            message: 'Title already exist!',
            result: null,
        })
    }

    let result = await Category.findOneAndUpdate({
        _id: id
    }
        , {
            $push: {
                subCategories: {
                    title, description
                }
            }
        }, { new: true })

        return res.json({
            success: true,
            error: false,
            message: 'Sub category added Successfull'
        })






})

// const editSubCategory = asyncHandler(async (req, res, next) => {
//     let {subId, catId, } = req.body;
//     console.log(req.body);
//     let category = await Category.findOne({_id: catId});
    
//     let subCategoryExist = category.subCategories.find(item => item._id.toString() == subId);
//     console.log(subCategoryExist, 'subcategory exsit')

    
// })





module.exports = {
    loadCategories,
    listUnlistCategory,
    loadAddCategory,
    loadEditCategory,
    loadSubCategories,
    loadAddSubCategory,
    loadEditSubCategory,
    addCategory,
    submitEditCategory,
    addSubCategory,
    editSubCategory,

}



