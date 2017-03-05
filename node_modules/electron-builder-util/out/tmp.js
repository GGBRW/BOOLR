"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TmpDir = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = _interopRequireDefault(require("bluebird-lst"));
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

var _log;

function _load_log() {
    return _log = require("./log");
}

var _promise;

function _load_promise() {
    return _promise = require("./promise");
}

var _util;

function _load_util() {
    return _util = require("./util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.setMaxListeners(30);
let tempDirPromise;
let tempDir;
function getTempDir() {
    if (tempDirPromise == null) {
        let promise;
        const systemTmpDir = process.env.TEST_DIR || (0, (_os || _load_os()).tmpdir)();
        if ((_fsExtraP || _load_fsExtraP()).mkdtemp == null) {
            const dir = _path.join(systemTmpDir, (0, (_util || _load_util()).getTempName)("electron-builder"));
            promise = (0, (_fsExtraP || _load_fsExtraP()).mkdirs)(dir, { mode: 448 }).then(() => dir);
        } else {
            promise = (0, (_fsExtraP || _load_fsExtraP()).mkdtemp)(`${_path.join(systemTmpDir, "electron-builder")}-`);
        }
        tempDirPromise = promise.then(dir => {
            tempDir = dir;
            const cleanup = () => {
                if (tempDir == null) {
                    return;
                }
                tempDir = null;
                try {
                    (0, (_fsExtraP || _load_fsExtraP()).removeSync)(dir);
                } catch (e) {
                    if (e.code !== "EPERM") {
                        (0, (_log || _load_log()).warn)(`Cannot delete temporary dir "${dir}": ${(e.stack || e).toString()}`);
                    }
                }
            };
            process.on("exit", cleanup);
            process.on("uncaughtException", cleanup);
            process.on("SIGINT", cleanup);
            return dir;
        });
    }
    return tempDirPromise;
}
let tmpFileCounter = 0;
class TmpDir {
    constructor() {
        this.tempFiles = [];
    }
    getTempFile(suffix) {
        if (this.tempPrefixPromise == null) {
            this.tempPrefixPromise = getTempDir().then(it => _path.join(it, (tmpFileCounter++).toString(16)));
        }
        return this.tempPrefixPromise.then(it => {
            const result = `${it}-${(tmpFileCounter++).toString(16)}${suffix.length === 0 || suffix.startsWith(".") ? suffix : `-${suffix}`}`;
            this.tempFiles.push(result);
            return result;
        });
    }
    cleanup() {
        const tempFiles = this.tempFiles;
        if (tempFiles.length === 0) {
            return (_bluebirdLst || _load_bluebirdLst()).default.resolve();
        }
        this.tempFiles = [];
        this.tempPrefixPromise = null;
        return (0, (_promise || _load_promise()).all)(tempFiles.map(it => (0, (_fsExtraP || _load_fsExtraP()).remove)(it).catch(e => {
            if (e.code !== "EPERM") {
                (0, (_log || _load_log()).warn)(`Cannot delete temporary dir "${it}": ${(e.stack || e).toString()}`);
            }
        })));
    }
}
exports.TmpDir = TmpDir; //# sourceMappingURL=tmp.js.map