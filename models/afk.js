const mongo = require('mongoose');

const Schema = new mongo.Schema({
    Guild: { type: String, default: null },
    Member: String,
    Reason: String,
    Time: { type: Date, default: Date.now },
    IsGlobal: { type: Boolean, default: false },
    Mentions: [String]
});

module.exports = mongo.model('afk', Schema);
