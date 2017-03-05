"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setPrinter = setPrinter;
exports.warn = warn;
exports.log = log;
exports.subTask = subTask;
exports.task = task;

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

var _nodeEmoji;

function _load_nodeEmoji() {
    return _nodeEmoji = require("node-emoji");
}

let printer = null;
function setPrinter(value) {
    printer = value;
}
class Logger {
    constructor(stream) {
        this.stream = stream;
    }
    warn(message) {
        this.log((0, (_chalk || _load_chalk()).yellow)(`Warning: ${message}`));
    }
    log(message) {
        if (printer == null) {
            this.stream.write(`${message}\n`);
        } else {
            printer(message);
        }
    }
    subTask(title, _promise) {
        this.log(`  ${title}`);
        return _promise;
    }
    task(title, _promise) {
        const promise = _promise;
        this.log(title);
        return promise;
    }
}
class TtyLogger extends Logger {
    constructor(stream) {
        super(stream);
    }
    warn(message) {
        this.log(`${(0, (_nodeEmoji || _load_nodeEmoji()).get)("warning")}  ${(0, (_chalk || _load_chalk()).yellow)(message)}`);
    }
}
const logger = process.stdout.isTTY ? new TtyLogger(process.stdout) : new Logger(process.stdout);
function warn(message) {
    logger.warn(message);
}
function log(message) {
    logger.log(message);
}
function subTask(title, promise) {
    return logger.subTask(title, promise);
}
function task(title, promise) {
    return logger.task(title, promise);
}
//# sourceMappingURL=log.js.map