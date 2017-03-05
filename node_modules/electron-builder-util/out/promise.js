"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NestedError = exports.executeFinally = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

// you don't need to handle error in your task - it is passed only indicate status of promise
let executeFinally = exports.executeFinally = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (promise, task) {
        let result = null;
        try {
            result = yield promise;
        } catch (originalError) {
            try {
                yield task(true);
            } catch (taskError) {
                throw new NestedError([originalError, taskError]);
            }
            throw originalError;
        }
        try {
            yield task(false);
        } catch (taskError) {
            throw taskError;
        }
        return result;
    });

    return function executeFinally(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.printErrorAndExit = printErrorAndExit;
exports.all = all;
exports.throwError = throwError;

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function printErrorAndExit(error) {
    console.error((0, (_chalk || _load_chalk()).red)((error.stack || error).toString()));
    process.exit(-1);
}class NestedError extends Error {
    constructor(errors) {
        let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Compound error: ";

        let m = message;
        let i = 1;
        for (const error of errors) {
            const prefix = "Error #" + i++ + " ";
            m += "\n\n" + prefix + "-".repeat(80) + "\n" + error.stack;
        }
        super(m);
    }
}
exports.NestedError = NestedError;
function all(promises) {
    const errors = [];
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.all(promises.map(it => it.catch(it => errors.push(it)))).then(() => throwError(errors));
}
function throwError(errors) {
    if (errors.length === 1) {
        throw errors[0];
    } else if (errors.length > 1) {
        throw new NestedError(errors, "Cannot cleanup: ");
    }
}
//# sourceMappingURL=promise.js.map