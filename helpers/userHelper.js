const Joi = require("joi")

const userLoginVal = Joi.object({
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
        // .regex(/[ -~]*[a-z][ -~]*/) // at least 1 lower-case
        // .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
        // // .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
        // .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
        // .min(6)
        // .required()
        // .messages({
        //     'string.pattern.base': 'Password must have at least 1 lower-case 1 upper-case 1 number',
        //     'any.required': `Password is a required field`,
        //     'string.min': `Password must have  minimum 6 length`,

        // }),
        ,
    confirmPassword: Joi.ref('password'),



})


module.exports = {
    userLoginVal,

}