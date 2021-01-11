/*
 * Title:Uptime monitoring app
 * Description:A restfull API to monitor up or down time of user difined linkd
 * Author:Mks Tamin
 * Date: 04.01.2021
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { sendTwilioSms } = require('./helpers/notifications');
// app object - module scaffolding
const app = {};

// @TODO: remove leter
sendTwilioSms('01811559011', 'Hello World', (err) => {
    console.log('This is the error', err);
});

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
