#! /usr/bin/env node
"use strict";

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let main = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        const projectDir = process.cwd();
        const config = yield (0, (_readPackageJson || _load_readPackageJson()).loadConfig)(projectDir);
        (0, (_log || _load_log()).log)(`Execute node-gyp rebuild for ${args.platform}:${args.arch}`);
        yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(process.platform === "win32" ? "node-gyp.cmd" : "node-gyp", ["rebuild"], {
            env: (0, (_yarn || _load_yarn()).getGypEnv)((yield (0, (_readPackageJson || _load_readPackageJson()).getElectronVersion)(config, projectDir)), args.platform, args.arch, true)
        });
    });

    return function main() {
        return _ref.apply(this, arguments);
    };
})();

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
}

var _yargs;

function _load_yargs() {
    return _yargs = _interopRequireDefault(require("yargs"));
}

var _readPackageJson;

function _load_readPackageJson() {
    return _readPackageJson = require("../util/readPackageJson");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _yarn;

function _load_yarn() {
    return _yarn = require("../yarn");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const args = (_yargs || _load_yargs()).default.option("platform", {
    choices: ["linux", "darwin", "win32"],
    default: process.platform
}).option("arch", {
    choices: ["ia32", "x64", "armv7l"],
    default: process.arch
}).argv;

main().catch((_promise || _load_promise()).printErrorAndExit);
//# sourceMappingURL=node-gyp-rebuild.js.map