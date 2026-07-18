const feedEngine = require('../services/feedEngine');

exports.getFeed = async (req, res, next) => {
    try {
        const feed = await feedEngine.generateFeed(req.user._id);
        
        res.status(200).json({
            success: true,
            data: {
                generatedAt: new Date().toISOString(),
                shoppingTip: feed.shoppingTip,
                sections: feed.sections
            }
        });
    } catch (error) {
        next(error);
    }
};
