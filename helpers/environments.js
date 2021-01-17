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
        fromPhone: '+14253577251',
        accountSid: 'AC224480f8933cf03581f0a1c0cf0a23c8',
        authToken: 'e6405ed72a639d1577da4398f63f3c17',
    },
};
environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'skfjskdfdfdsajslkaka',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14253577251',
        accountSid: 'AC224480f8933cf03581f0a1c0cf0a23c8',
        authToken: 'e6405ed72a639d1577da4398f63f3c17',
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
