const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const register = {
    body: Joi.object().keys({
        name: Joi.string().trim().min(2).required().messages({
            'string.min': 'Name must be at least 2 characters'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address'
        }),
        password: Joi.string().pattern(passwordPattern).required().messages({
            'string.pattern.base': 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords do not match'
        })
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        rememberMe: Joi.boolean().optional()
    }),
};

module.exports = {
    register,
    login,
};
