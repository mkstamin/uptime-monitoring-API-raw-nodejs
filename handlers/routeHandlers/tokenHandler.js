/* eslint-disable no-underscore-dangle */
/* eslint-disable operator-linebreak */
/*
 * Title:Token Handler
 * Description:Token Handler handle all the Token related routes
 * Author:Mks Tamin
 * Date: 07.01.2021
 *
 */

// dependencies
const data = require('../../lib/data');
const { hash, createRandomString, parseJSON } = require('../../helpers/utilities');

// moudle scaffolding
const handler = {};

handler.tokenHandler = (requestPropeties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPropeties.method) > -1) {
        handler._token[requestPropeties.method](requestPropeties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestPropeties, callback) => {
    const phone =
        typeof requestPropeties.body.phone === 'string' &&
        requestPropeties.body.phone.trim().length === 11
            ? requestPropeties.body.phone
            : false;

    const password =
        typeof requestPropeties.body.password === 'string' &&
        requestPropeties.body.password.trim().length > 0
            ? requestPropeties.body.password
            : false;

    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashedpassword = hash(password);
            if (hashedpassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };

                // store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'There is a problem in the server side!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._token.get = (requestPropeties, callback) => {
    // check the id if valid
    const id =
        typeof requestPropeties.queryStringObject.id === 'string' &&
        requestPropeties.queryStringObject.id.trim().length === 20
            ? requestPropeties.queryStringObject.id
            : false;

    if (id) {
        // lookup the Token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested Token was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested Token was not found!',
        });
    }
};

handler._token.put = (requestPropeties, callback) => {
    // check the id if valid
    const id =
        typeof requestPropeties.body.id === 'string' &&
        requestPropeties.body.id.trim().length === 20
            ? requestPropeties.body.id
            : false;

    const extend = !!(
        typeof requestPropeties.body.extend === 'boolean' && requestPropeties.body.extend === true
    );

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                // store the updated token
                data.update('tokens', id, tokenObject, (err1) => {
                    if (!err1) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a server side errore!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expired!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

handler._token.delete = (requestPropeties, callback) => {
    // check the token if valid
    const id =
        typeof requestPropeties.queryStringObject.id === 'string' &&
        requestPropeties.queryStringObject.id.trim().length === 20
            ? requestPropeties.queryStringObject.id
            : false;

    if (id) {
        // lookup the token
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'Token successfully deleded!',
                        });
                    } else {
                        callback(500, {
                            error: 'There is a server side error!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There is a server side error!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a proble in you request!',
        });
    }
};

// token verification function
handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
