require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Reference the users collection directly to bypass Mongoose schema restrictions
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        console.log('Starting migration...');

        // Find users that have isEmailVerified: true OR isVerified: true
        const filter = {
            $or: [
                { isEmailVerified: true },
                { isVerified: true }
            ]
        };

        // Set isVerified to true for those users
        const updateResult = await usersCollection.updateMany(filter, {
            $set: { isVerified: true }
        });
        
        console.log(`Matched ${updateResult.matchedCount} users, modified ${updateResult.modifiedCount} users to set isVerified = true.`);

        // Now unconditionally remove the isEmailVerified field from ALL users
        const removeResult = await usersCollection.updateMany(
            { isEmailVerified: { $exists: true } },
            { $unset: { isEmailVerified: "" } }
        );

        console.log(`Removed isEmailVerified field from ${removeResult.modifiedCount} users.`);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

migrate();
