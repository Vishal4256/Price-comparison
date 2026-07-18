const Joi = require('joi');

const search = {
    query: Joi.object().keys({
        q: Joi.string().trim().min(2).required().messages({
            'string.min': 'Search query must be at least 2 characters',
            'any.required': 'Search query is required'
        }),
        // Optional filters
        minPrice: Joi.number().min(0).optional(),
        maxPrice: Joi.number().min(0).optional()
    }),
};

module.exports = {
    search,
};
