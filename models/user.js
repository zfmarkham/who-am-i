var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionDataSchema = new Schema({
    id: Schema.Types.ObjectId,
    attempts: Number,
    clues: Number
});

var userSchema = new Schema({
    id: String,
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    points: Number,
    questionData: [questionDataSchema]
});

module.exports = mongoose.model('User', userSchema);