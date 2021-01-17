/* eslint-disable no-underscore-dangle */
/* eslint-disable operator-linebreak */
/*
 * Title:Check Handler
 * Description:Handler to handle user defined checks
 * Author:Mks Tamin
 * Date: 08.01.2021
 *
 */

// dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// moudle scaffolding
const handler = {};

handler.checkHandler = (requestPropeties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPropeties.method) > -1) {
        handler._check[requestPropeties.method](requestPropeties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestPropeties, callback) => {
    // validate inputs
    const protocol =
        typeof requestPropeties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestPropeties.body.protocol) > -1
            ? requestPropeties.body.protocol
            : false;

    const url =
        typeof requestPropeties.body.url === 'string' && requestPropeties.body.url.trim().length > 0
            ? requestPropeties.body.url
            : false;

    const method =
        typeof requestPropeties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestPropeties.body.method) > -1
            ? requestPropeties.body.method
            : false;

    const successCodes =
        typeof requestPropeties.body.successCodes === 'object' &&
        requestPropeties.body.successCodes instanceof Array
            ? requestPropeties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestPropeties.body.timeoutSeconds === 'number' &&
        requestPropeties.body.timeoutSeconds % 1 === 0 &&
        requestPropeties.body.timeoutSeconds >= 1 &&
        requestPropeties.body.timeoutSeconds <= 5
            ? requestPropeties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // verify token
        const token =
            typeof requestPropeties.headersObject.token === 'string'
                ? requestPropeties.headersObject.token
                : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error:
                                                            'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There is a proble in you request!',
        });
    }
};

handler._check.get = (requestPropeties, callback) => {
    const id =
        typeof requestPropeties.queryStringObject.id === 'string' &&
        requestPropeties.queryStringObject.id.trim().length === 20
            ? requestPropeties.queryStringObject.id
            : false;

    if (id) {
        // loopup the check
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestPropeties.headersObject.token === 'string'
                        ? requestPropeties.headersObject.token
                        : false;

                const checkObject = parseJSON(checkData);

                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, checkObject);
                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You hava a problem in your request!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'You hava a problem in your request!',
        });
    }
};

handler._check.put = (requestPropeties, callback) => {
    const id =
        typeof requestPropeties.body.id === 'string' &&
        requestPropeties.body.id.trim().length === 20
            ? requestPropeties.body.id
            : false;

    // validate inputs
    const protocol =
        typeof requestPropeties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestPropeties.body.protocol) > -1
            ? requestPropeties.body.protocol
            : false;

    const url =
        typeof requestPropeties.body.url === 'string' && requestPropeties.body.url.trim().length > 0
            ? requestPropeties.body.url
            : false;

    const method =
        typeof requestPropeties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestPropeties.body.method) > -1
            ? requestPropeties.body.method
            : false;

    const successCodes =
        typeof requestPropeties.body.successCodes === 'object' &&
        requestPropeties.body.successCodes instanceof Array
            ? requestPropeties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestPropeties.body.timeoutSeconds === 'number' &&
        requestPropeties.body.timeoutSeconds % 1 === 0 &&
        requestPropeties.body.timeoutSeconds >= 1 &&
        requestPropeties.body.timeoutSeconds <= 5
            ? requestPropeties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);

                    const token =
                        typeof requestPropeties.headersObject.token === 'string'
                            ? requestPropeties.headersObject.token
                            : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // update the checkobject
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a server side error!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication error!',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'There was a problem in server side!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at last one filed to update!',
            });
        }
    } else {
        callback(400, {
            error: 'You hava a problem in your request!',
        });
    }
};

handler._check.delete = (requestPropeties, callback) => {
    const id =
        typeof requestPropeties.queryStringObject.id === 'string' &&
        requestPropeties.queryStringObject.id.trim().length === 20
            ? requestPropeties.queryStringObject.id
            : false;

    if (id) {
        // loopup the check
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestPropeties.headersObject.token === 'string'
                        ? requestPropeties.headersObject.token
                        : false;

                const checkObject = parseJSON(checkData);

                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // delete the check data
                        data.delete('checks', id, (err1) => {
                            if (!err1) {
                                data.read('users', checkObject.userPhone, (err2, userData) => {
                                    const userObject = parseJSON(userData);
                                    if (!err2 && userData) {
                                        const userChecks =
                                            typeof userObject.checks === 'object' &&
                                            userObject.checks instanceof Array
                                                ? userObject.checks
                                                : [];

                                        // remove the daleted check id from user's list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            const { phone } = userObject;
                                            userChecks.splice(checkPosition, 1);
                                            // reseve the user data
                                            userObject.checks = userChecks;
                                            data.update('users', phone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side error!',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error:
                                                    'The check id that you are try to remove is not found in user!',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'There was a server side error!',
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You hava a problem in your request!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'You hava a problem in your request!',
        });
    }
};

module.exports = handler;
