/* Found serial ports */
var serialPorts = [];
/* Opened serial port connection ID */
var connectionId = -1;

/* Logging messages */
function log(msg) {
    var msg_str = (typeof(msg) == 'object') ? JSON.stringify(msg) : msg;
    console.log(msg_str);

    var l = document.getElementById('log');
    if (l) {
        l.innerText += msg_str + '\n';
    }
}

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
    var encodedString = unescape(encodeURIComponent(str));
    var bytes = new Uint8Array(encodedString.length);
    for (var i = 0; i < encodedString.length; ++i) {
        bytes[i] = encodedString.charCodeAt(i);
    }
    return bytes.buffer;
};

/* When serial */
var onFinishedGettingDevices = function(foundSerialPorts) {
    /* Push all found serial ports to the list */
    for (var i = 0; i < foundSerialPorts.length; i++) {
        serialPorts.push(foundSerialPorts[i].path);
        log("Device " + i + ": " + foundSerialPorts[i].path);
    }
    /* When no serial ports found */
    if (serialPorts.length == 0) {
        log("No serial ports found");
        /* TODO: send out external message to user */
        return;
    }
    log("Connecting to serial ...");
    /* Connect to the first serial port */
    /* TODO: send out external message and let user choose port to connect to */
    chrome.serial.connect(serialPorts[0], onConnectFinished);
};

/* When connecting to serial port finished */
var onConnectFinished = function(connectionInfo) {
    /* When conneting to serial port failed */
    if (!connectionInfo) {
        log("Connection failed");
        /* TODO: send out external message to user */
        return;
    }
    connectionId = connectionInfo.connectionId;
    /* Successfully connected to the serial port */
    log("Successfully connected to: " + connectionInfo.connectionInfo);
}

/* If LED is on */
var is_on = false;
document.querySelector('button').addEventListener('click', function() {
    is_on = !is_on;
    chrome.serial.send(connectionId, str2ab(is_on ? 'y' : 'n'), function() {});
});

/* External messages from other extensions, apps or websites */
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        log("Got message, sender url: " + sender.url);
    }
);

log("Getting serial devices ...");
/* Get all serial devices */
chrome.serial.getDevices(onFinishedGettingDevices);
