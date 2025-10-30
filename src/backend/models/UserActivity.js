// src/backend/models/UserActivity.js
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['RATED_MOVIE', 'WROTE_REVIEW', 'ADDED_TO_FAVORITES']
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    details: {
        movieId: {
            type: Number,
            required: true
        },
        movieTitle: {
            type: String,
            required: true
        },
        rating: Number,
        reviewId: String,
        reviewText: String
    }
});

userActivitySchema.index({ userId: 1, timestamp: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;