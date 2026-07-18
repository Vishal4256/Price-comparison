const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    // Only validate what is present in the schema (body, query, or params)
    const validSchema = Joi.object(schema);
    const objectToValidate = {};
    if (schema.body) objectToValidate.body = req.body;
    if (schema.query) objectToValidate.query = req.query;
    if (schema.params) objectToValidate.params = req.params;

    const { value, error } = validSchema.validate(objectToValidate, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: errorMessage
            }
        });
    }

    // Assign validated values back (safely for Express 5)
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) Object.assign(req.query, value.query);
    
    return next();
};

module.exports = validate;
