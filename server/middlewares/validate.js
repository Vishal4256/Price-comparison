const { ValidationError } = require('../errors/AppError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const messages = error.details.map(detail => detail.message).join(', ');
      return next(new ValidationError(messages));
    }
    
    next();
  };
};

module.exports = validate;
