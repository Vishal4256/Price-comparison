/**
 * Capability Registry
 * Defines what each retailer is capable of. 
 * Orchestrators consult this before attempting actions.
 */
const CAPABILITIES = {
    AMAZON: {
        canSearch: true,
        canFetchHistory: true,
        canExtractReviews: true
    },
    FLIPKART: {
        canSearch: true,
        canFetchHistory: false,
        canExtractReviews: true
    },
    MYNTRA: {
        canSearch: true,
        canFetchHistory: false,
        canExtractReviews: false
    },
    AJIO: {
        canSearch: true,
        canFetchHistory: false,
        canExtractReviews: false
    },
    NYKAA: {
        canSearch: true,
        canFetchHistory: false,
        canExtractReviews: false
    },
    CROMA: {
        canSearch: true,
        canFetchHistory: false,
        canExtractReviews: false
    }
};

module.exports = CAPABILITIES;
