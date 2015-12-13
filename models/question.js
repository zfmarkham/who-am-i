
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id: String,
    answer: String,
    facts: [String]
});

module.exports = mongoose.model('Question', schema);