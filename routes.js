/*
 * Title:Routes
 * Description:Application Routes
 * Author:Mks Tamin
 * Date: 04.01.2021
 *
 */

// dependencis
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

const routes = {
    sample: sampleHandler,
};

module.exports = routes;
