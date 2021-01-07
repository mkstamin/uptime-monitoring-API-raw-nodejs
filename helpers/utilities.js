/*
 * Title:Utilities
 * Description:Importent utility
 * Author:Mks Tamin
 * Date: 06.01.2021
 *
 */

// dependencies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// parse JSON string to Object
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');

        return hash;
    }
    return false;
};

// create random string
utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

    if (length) {
        const possiblecharacters = 'abcdefghijklmnopurstqvwxyz1234567890';
        let output = '';

        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = possiblecharacters.charAt(
                // eslint-disable-next-line comma-dangle
                Math.floor(Math.random() * possiblecharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }
    return false;
};

// export module
module.exports = utilities;
