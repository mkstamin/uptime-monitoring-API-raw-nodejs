/* eslint-disable operator-linebreak */
/*
 * Title:Workers file
 * Description:Workers relited file
 * Author:Mks Tamin
 * Date: 09.01.2021
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// workwr object - module scaffolding
const worker = {};

// lookup all the checks
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                // read the checkData
                data.read('checks', check, (err1, originalCheckData) => {
                    if (!err1 && originalCheckData) {
                        // pass the data to the cheak validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the checks data!');
                    }
                });
            });
        } else {
            console.log('Error: Could not find any checks to process!');
        }
    });
};

// validate individual check
worker.validateCheckData = (originalCheckData) => {
    const originalData = originalCheckData;
    if (originalCheckData && originalCheckData.id) {
        originalData.state =
            typeof originalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : 'down';

        originalData.lastChecked =
            typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
                ? originalCheckData.lastChecked
                : false;

        // pass to the next process
        worker.performCheck(originalData);
    } else {
        console.log('Error: Check was invalid or properly formatted!');
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname and full url from the original data
    const parseUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parseUrl.hostname;
    const { path } = parseUrl;

    // construct the request
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: false,
            value: e,
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();
};

// save check outcome to database and next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if checkoutcome is up or down
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not
    const latertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (latertWanted) {
                // send the checkdata to next process
                worker.alertUserToStatusChang(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error: trying to save check data one of the checks!');
        }
    });
};

// send notification sms to user if state changes
worker.alertUserToStatusChang = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    console.log(newCheckData);

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerated to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

// timer the continue the worker process
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000);
};

// start the workwrs
worker.init = () => {
    // execute all the chacks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
};

// export
module.exports = worker;
