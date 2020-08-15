'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    tweets: [{type: Schema.Types.ObjectId, ref: 'tweet'}],
    noTweet: Number,
    followers: [{type: String}],
    noFollowers: Number
});

module.exports = mongoose.model('user', userSchema);