#! /usr/bin/env node
"use strict";

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let main = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        const args = (_yargs || _load_yargs()).default.option("platform", {
            choices: ["linux", "darwin", "win32"],
            default: process.platform
        }).option("arch", {
            choices: ["ia32", "x64", "all"],
            default: process.arch
        }).argv;
        const projectDir = process.cwd();
        const config = (yield (0, (_readPackageJson || _load_readPackageJson()).loadConfig)(projectDir)) || {};
        const results = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_electronBuilderUtil || _load_electronBuilderUtil()).computeDefaultAppDirectory)(projectDir, (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(config.directories, function (it) {
            return it.app;
        })), (0, (_readPackageJson || _load_readPackageJson()).getElectronVersion)(config, projectDir)]);
        // if two package.json — force full install (user wants to install/update app deps in addition to dev)
        yield (0, (_yarn || _load_yarn()).installOrRebuild)(config, results[0], results[1], args.platform, args.arch, results[0] !== projectDir);
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

var _yarn;

function _load_yarn() {
    return _yarn = require("../yarn");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

main().catch((_promise || _load_promise()).printErrorAndExit);
//# sourceMappingURL=install-app-deps.js.map