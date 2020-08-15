'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const key = 'TwitterJS';

exports.createToken = (user)=>{
    let payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(24, "hours").unix()
    };
    return jwt.encode(payload, key);
}

