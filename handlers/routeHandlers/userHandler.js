/* eslint-disable no-underscore-dangle */
/* eslint-disable operator-linebreak */
/*
 * Title:User Handler
 * Description:User Handler handle all the user related routes
 * Author:Mks Tamin
 * Date: 06.01.2021
 *
 */

// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// moudle scaffolding
const handler = {};

handler.userHandler = (requestPropeties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPropeties.method) > -1) {
        handler._users[requestPropeties.method](requestPropeties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestPropeties, callback) => {
    const firstName =
        typeof requestPropeties.body.firstName === 'string' &&
        requestPropeties.body.firstName.trim().length > 0
            ? requestPropeties.body.firstName
            : false;

    const lastName =
        typeof requestPropeties.body.lastName === 'string' &&
        requestPropeties.body.lastName.trim().length > 0
            ? requestPropeties.body.lastName
            : false;

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

    const tosAgreement =
        typeof requestPropeties.body.tosAgreement === 'boolean' &&
        requestPropeties.body.tosAgreement
            ? requestPropeties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exists
        data.read('users', phone, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'User created successfully',
                        });
                    } else {
                        callback(500, { error: 'Could not crete user!' });
                    }
                });
            } else {
                callback(500, {
                    error: 'There is a proble in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

// @TODO: Authentication
handler._users.get = (requestPropeties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestPropeties.queryStringObject.phone === 'string' &&
        requestPropeties.queryStringObject.phone.trim().length === 11
            ? requestPropeties.queryStringObject.phone
            : false;

    if (phone) {
        // lookup the user
        data.read('users', phone, (err, u) => {
            const user = { ...parseJSON(u) };
            if (!err && user) {
                delete user.password;
                callback(200, user);
            } else {
                callback(404, {
                    error: 'Requested user was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested user was not found!',
        });
    }
};

// @TODO: Authentication
handler._users.put = (requestPropeties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestPropeties.body.phone === 'string' &&
        requestPropeties.body.phone.trim().length === 11
            ? requestPropeties.body.phone
            : false;

    const firstName =
        typeof requestPropeties.body.firstName === 'string' &&
        requestPropeties.body.firstName.trim().length > 0
            ? requestPropeties.body.firstName
            : false;

    const lastName =
        typeof requestPropeties.body.lastName === 'string' &&
        requestPropeties.body.lastName.trim().length > 0
            ? requestPropeties.body.lastName
            : false;

    const password =
        typeof requestPropeties.body.password === 'string' &&
        requestPropeties.body.password.trim().length > 0
            ? requestPropeties.body.password
            : false;

    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            data.read('users', phone, (err, uData) => {
                const userData = { ...parseJSON(uData) };
                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }

                    // update to db
                    data.update('users', phone, userData, (err1) => {
                        if (!err1) {
                            callback(200, {
                                message: 'User was updated successfully!',
                            });
                        } else {
                            callback(500, {
                                error: 'There was a problem in the server side!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'You hava a problem in your request!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You hava a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number.Please try again!',
        });
    }
};

// @TODO: Authentication
handler._users.delete = (requestPropeties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestPropeties.queryStringObject.phone === 'string' &&
        requestPropeties.queryStringObject.phone.trim().length === 11
            ? requestPropeties.queryStringObject.phone
            : false;

    if (phone) {
        // lookup the user
        data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                data.delete('users', phone, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'User successfully deleded!',
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

module.exports = handler;
