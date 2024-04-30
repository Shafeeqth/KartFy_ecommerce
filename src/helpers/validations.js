const Joi = require("joi")

const userValidation = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .max(20)
        .required()
        .trim()
        .messages({
            'string.base': `Name should be a type of 'text'`,
            'string.empty': `Name cannot be an empty field`,
            'string.min': `Name should have a minimum length of 3`,
            'any.required': `Name is a required field`,
            'string.trim': 'Name must not have leading or trailing whitespace',

        }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'yahoo'] } })
        .required()
        .messages({
            'any.required': `Email is a required field`,
            'string.email': 'Email must be a valid email',

        }),
    // mobile: Joi.string()
    //     .length(10)
    //     .pattern(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/)
    //     .required(),
    password: Joi.string()
        .regex(/[ -~]*[a-z][ -~]*/) // at least 1 lower-case
        .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
        .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
        .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
        .min(6)
        .required()
        .messages({
            'string.pattern.base': 'Password must have at least 1 lower-case 1 upper-case 1 number',
            'any.required': `Password is a required field`,
            'string.min': `Password must have  minimum 6 length`,

        })
        ,
    confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
        'string.base': 'Confirm password must be a string',
        'any.only': 'Confirm password must match the password',
        'any.required': 'Confirm password is required'
    })



})

const resetPasswordValidation = Joi.object({
    password: Joi.string()
        .regex(/[ -~]*[a-z][ -~]*/) // at least 1 lower-case
        .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
        .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
        .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
        .min(6)
        .required()
        .messages({
            'string.pattern.base': 'Password must have at least 1 lower-case 1 upper-case 1 number',
            'any.required': `Password is a required field`,
            'string.min': `Password must have  minimum 6 length`,

        })
        ,
    confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
        'string.base': 'Confirm password must be a string',
        'any.only': 'Confirm password must match the password',
        'any.required': 'Confirm password is required'
    })
})

const productValidation = Joi.object({
    title: Joi.string()
        .alphanum()
        .min(3)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .max(20)
        .required()
        .trim()
        .messages({
            'string.base': `Title should be a type of 'text'`,
            'string.empty': `Title cannot be an empty field`,
            'string.min': `Title should have a minimum length of 3`,
            'any.required': `Title is a required field`,
            'string.trim': 'Title must not have leading or trailing whitespace',

        }),
        description: Joi.string()
        .max(50)
        .min(10)
        .required()
        .messages({
            'string.base': `Description should be a type of 'text'`,
            'string.empty': `Description cannot be an empty field`,
            'string.min': `Description should have a minimum length of 15`,
            'any.required': `Description is a required field`,
            'string.trim': 'Description must not have leading or trailing whitespace',
        }),
        mrpPrice: Joi.number()
        .required()
        .positive()
        .min(1)
        
        .messages({
            'number.integer': 'MRP must be an integer',
            'any.required': 'MRP is a required field',
            'number.min': 'MRP is must be at least 1',
            'number.positive': 'MRP must be posative value'
        }),
        price: Joi.number()
        .required()
        .positive()
        .min(1)
        .max(Joi.ref('mrpPrice'))
        .messages({
            'number.integer': 'Price must be an integer',
            'any.required': 'Price is a required field',
            'number.min': 'Price is must be at least 1',
            'number.max': 'Price must be less than MRP',
            'number.positive': 'Price must be posative value'
        }),
        // stock: Joi.number()
        // .required()
        // .integer()
        // .min(1)
        // .max(200)
        // .messages({
        //     'number.integer': 'Size must be an integer',
        //     'any.required': 'Size is a required field',
        //     'number.min': 'Size is must be at least 1',
        //     'number.max': 'Size must be less than 200',
        //     'number.positive': 'Size must be posative value'
        // }),



   
       
    



})


const cagetoryValidation = Joi.object({
    title: Joi.string()
       
        .min(3)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .max(20)
        .required()
        .trim()
        .messages({
            'string.base': `Title should be a type of 'text'`,
            'string.empty': `Title cannot be an empty field`,
            'string.min': `Title should have a minimum length of 3`,
            'any.required': `Title is a required field`,
            'string.trim': 'Title must not have leading or trailing whitespace',

        }),
        description: Joi.string()
    
        .max(50)
        .min(10)
        .required()
        .messages({
            'string.base': `Description should be a type of 'text'`,
            'string.empty': `Description cannot be an empty field`,
            'string.min': `Description should have a minimum length of 10`,
            'any.required': `Description is a required field`,
            'string.trim': 'Description must not have leading or trailing whitespace',
        })
    })


const userAndemailValid = Joi.object({
    name: Joi.string()
    .alphanum()
    .min(3)
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .max(20)
    .required()
    .messages({
        'string.base': `Name should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min': `Name should have a minimum length of 3`,
        'any.required': `Name is a required field`,
        'string.trim': 'Name must not have leading or trailing whitespace',

    }),

})

const addressValidator = Joi.object({
    name: Joi.string()
        .min(3)
        .regex(/^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/)
        .max(50)
        .required()
        .trim()
        .messages({
            'string.base': `Name should be a type of 'text'`,
            'string.pattern.base': 'Name must be a Valid name',
            'string.empty': `Name cannot be an empty field`,
            'string.min': `Name should have a minimum length of 3`,
            'any.required': `Name is a required field`,
            'string.trim': 'Name must not have leading or trailing whitespace',

        }),
   
        phone: Joi.string()
        .length(10)
        .pattern(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Mobile must be a Valid Number',
            'any.required': `Mobile is a required field`,
            'string.length': `Mobile must have  minimum 10 length`,

        }),
        alternatePhone: Joi.string()
        .length(10)
        .pattern(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/)
        .messages({
            'string.pattern.base': 'Mobile must be a Valid Number',
            'string.length': `Mobile must have  minimum 10 length`,

        }),
        locality: Joi.string()
        .alphanum()
        .min(3)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .max(50)
        .required()
        .trim()
        .messages({
            'string.base': `Locality should be a type of 'text'`,
            'string.empty': `Locality cannot be an empty field`,
            'string.min': `Locality should have a minimum length of 3`,
            'any.required': `Locality is a required field`,
            'string.trim': 'Locality must not have leading or trailing whitespace',

        }),
        district: Joi.string()
        .alphanum()
        .min(3)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .max(20)
        .required()
        .trim()
        .messages({
            'string.base': `District should be a type of 'text'`,
            'string.empty': `Distric cannot be an empty field`,
            'string.min': `Distric should have a minimum length of 3`,
            'any.required': `Distric is a required field`,
            'string.trim': 'Distric must not have leading or trailing whitespace',

        }),
        pincode: Joi.string()
        .length(6)
        .required()
        .messages({
            'string.base': `Pincode must be valid`,
            'string.lenghth': `Pincode must be 6 charectors`,
            'any.required': `Pincode is a required field`,
            'string.trim': 'Name must not have leading or trailing whitespace',

        }),
        street: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
    
        .messages({
            'string.base': `Street should be a type of 'text'`,
            'string.empty': `Street cannot be an empty field`,
            'string.min': `Street should have a minimum length of 3`,
            'any.required': `Street is a required field`,
            'string.trim': 'Street must not have leading or trailing whitespace',

        }),
    
    



})







module.exports = {
    userValidation,
    productValidation,
    cagetoryValidation,
    resetPasswordValidation,
    userAndemailValid,
    addressValidator,

}