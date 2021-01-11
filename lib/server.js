/*
 * Title:Server file
 * Description:Server relited file
 * Author:Mks Tamin
 * Date: 09.01.2021
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');
const { sendTwilioSms } = require('../helpers/notifications');

// server object - module scaffolding
const server = {};

// @TODO: remove leter
sendTwilioSms('01811559011', 'Hello World', (err) => {
    console.log('This is the error', err);
});

// create server
server.createServer = () => {
    const carateServerVar = http.createServer(server.handleReqRes);

    carateServerVar.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

// export
module.exports = server;
