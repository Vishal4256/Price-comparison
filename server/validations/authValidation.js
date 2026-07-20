const Joi = require('joi');

const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  })
};

module.exports = authValidation;
