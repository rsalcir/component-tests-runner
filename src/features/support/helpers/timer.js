module.exports = function sleep(timeout) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, timeout);
    })
}