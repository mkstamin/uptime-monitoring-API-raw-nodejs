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
const data = require('./lib/data');

// app object - module scaffolding
const app = {};

// testing file system
// @TODO: will be delete
data.delete('test', 'newFile', (err) => {
    console.log('Error was ', err);
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
