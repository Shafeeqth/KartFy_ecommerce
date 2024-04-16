const userHelper = require('../helpers/userHelper');
const nodemailer = require('nodemailer');
const model = require('../models/Model');


;


const isLoged = async(req, res, next) => {
    if(!req.session.admin) {

        res.redirect('/admin/login')        
    }
    next();
}

const addCategory = async (req, res, next) => {

    let {title, description} = req.body.data;
    console.log(title, description);
    let alreadyCate;


    try {
        alreadyCate = await model.categoryModel.findOne({title: title.toLowerCase()});  

     } catch (error) {
        console.log(error)
        
    }
    if(alreadyCate) {

        return res.json({fail: true});

    
    }else if(title) {
        const category = new model.categoryModel({title, description});
        return category.save()
            .then((saved) => {
                console.log('this is saved ', saved)
                if(saved) {
                    res.json({saved:saved});
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }else{
        console.log('data not recieved');
    }
}

    
    


const listUnlistCategory = (req, res, next) => {
    const id = req.body.data
    
   
    return model.categoryModel.fin({id})
    .then((category) => {
        if(category.isListed) {
            

        return model.categoryModel.updateOne({_id: req.body.data}, 
            {$set: {
                isListed : false
            }})

        }else{

            return model.categoryModel.updateOne(
                {id},
                 {$set: 
                    {isListed: true}
                }
                )
                .then(() => {
                    res.json({listed:true});
                }).catch((error) => {
                    console.log(error)
                })


        }

    })

    


}


const addProduct = async (req, res, next) => {
    let {title, mrpPrice, size, description, price, color, stock, category } = req.body;
    
    
    let images = req.files.map(el => el.filename)
    console.log(images)

    try {
        let product = new model.productModel({title, mrpPrice, size, description, price, color, stock, category ,images});
        await product.save();
        res.redirect('/admin/products/add-product');

       
    } catch (error) {
        console.log(error)
        
    }

}


const deleteProduct = async (req, res, next) => {
    let {id} = req.body
    console.log(id)

    try {
        const product = await model.productModel.updateOne(
            {_id:id}, 
            {$set:{isDeleted: true}});
            return res.json({ok:true});      

    } catch (error) {
        console.log(error)
        
    }
}





const blockOrUnblockUser = async (req, res, next ) => {
    console.log('cames here')
    let {id} = req.body;
    return model.userModel.findOne({_id: id})
    .then((user) => {
        if(user.isBlocked) {

            return model.userModel.updateOne(
                {_id:id},
                {$set: {
                    isBlocked: false
                }})
            
        }else{
            return model.userModel.updateOne(
                {_id:id},
                {$set:
                {isBlocked:true}}
            )
        }

    }).then(()=> {
        res.json({block:true})
    })
    .catch((error) => {
        console.log(error)
    })

}




const deleteUser = async (req, res, next) => {
    let {id} = req.body

    try {
        const deleteUser = await model.userModel.findOneAndUpdate({_id:id},{$set:{isDeleted:true}},{upsert:true});
        return res.json({isDelete : true})
    } catch (error) {
        console.log(error)
        
    }
   
}



const submitEditCategory = async (req, res, next) => {

   let {title, description, id} =  req.body.data;
   console.log(title, description, id)
   

   try {
    let category = await model.categoryModel.find({title:title.toLowerCase()})
    
    if (!category) {

        try {
            await model.categoryModel.updateOne({_id:id}, {$set:{title,description}})
            return res.json({ saved:true })
            
        } catch (error) {
            console.log(error)
            
        }        
    } else {

       return res.json({fail:true})
        
    }
    
   } catch (error) {
    console.log(error)
    
   }
    
}


module.exports = {
    isLoged,
    addCategory,
    addProduct,
    blockOrUnblockUser,
    listUnlistCategory,
    deleteUser,
    submitEditCategory,
    deleteProduct,

    
    

}
 