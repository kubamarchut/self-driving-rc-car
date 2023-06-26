function addZero(num, length) {
    num = String(num);
    while (num.length < length) {
        num = "0" + num;
    }
    return num;
}
function getFormattedTime(type) {
    var today = new Date();
    var y = today.getFullYear();
    var m = addZero(today.getMonth() + 1, 2);
    var d = addZero(today.getDate(), 2);
    var h = addZero(today.getHours(), 2);
    var mi = addZero(today.getMinutes(), 2);
    var s = addZero(today.getSeconds(), 2);
    var ms = addZero(today.getMilliseconds(), 3);

    var output = d + "." + m + "." + y + "_" + h + "-" + mi + "-" + s;
    if (type != 'short') output += "-" + ms;
    return output;
}

exports.getFormattedTime = getFormattedTime;