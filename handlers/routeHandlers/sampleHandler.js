/*
 * Title:Sample Handler
 * Description:Sample Handler
 * Author:Mks Tamin
 * Date: 04.01.2021
 *
 */
// moudle scaffolding
const handle = {};

handle.sampleHandler = (requestPropeties, callback) => {
    // console.log(requestPropeties);

    callback(200, {
        message: 'This is a sample Url',
    });
};

module.exports = handle;
