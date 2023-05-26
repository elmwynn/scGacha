const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    playerId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    characterDeck: [Object],
    achievements: [Object],
    gifts: [Object],
    dailyRollCount: {
        type: Number,
        default: 0,
        required: true
    },
    pityRollCount: {
        type: Number,
        default: 0
    },
    rankRollCount: {
        type: Number,
        default: 0
    },
    goldenRollCount: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Player', playerSchema);