/*
 * Title:Not Fount Handler
 * Description:404 Not Found Handler
 * Author:Mks Tamin
 * Date: 04.01.2021
 *
 */
// moudle scaffolding
const handle = {};

handle.notFoundHandler = (requestPropeties, callback) => {
    callback(404, {
        message: 'Your requested url was not found!',
    });
};

module.exports = handle;
