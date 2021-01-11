/* eslint-disable operator-linebreak */
/*
 * Title:Environments
 * Description:Handle all environment
 * Author:Mks Tamin
 * Date: 05.01.2021
 *
 */

// dependencies
// module scaffolding
const environment = {};

environment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'skfjskdfjslkaka',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13392013608',
        accountSid: 'AC29054c0ec6b809414fe512c93f5d1ea4',
        authToken: 'c80d54f67c1634c7d4afe78d2d4fbf3c',
    },
};
environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'skfjskdfdfdsajslkaka',
    maxChecks: 5,
    twilio: {
        fromPhone: '+13392013608',
        accountSid: 'AC29054c0ec6b809414fe512c93f5d1ea4',
        authToken: 'c80d54f67c1634c7d4afe78d2d4fbf3c',
    },
};

// determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
    typeof environment[currentEnvironment] === 'object'
        ? environment[currentEnvironment]
        : environment.staging;

// export module
module.exports = environmentToExport;
