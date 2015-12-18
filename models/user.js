var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attemptsSchema = new Schema({
    questionId: Schema.Types.ObjectId,
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
    attempts: [attemptsSchema]
});

module.exports = mongoose.model('User', userSchema);