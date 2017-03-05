#! /usr/bin/env node
"use strict";

var _builder;

function _load_builder() {
    return _builder = require("../builder");
}

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
}

var _cliOptions;

function _load_cliOptions() {
    return _cliOptions = require("./cliOptions");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

var _updateNotifier;

function _load_updateNotifier() {
    return _updateNotifier = _interopRequireDefault(require("update-notifier"));
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _isCi;

function _load_isCi() {
    return _isCi = _interopRequireDefault(require("is-ci"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

if (!(_isCi || _load_isCi()).default && process.env.NO_UPDATE_NOTIFIER == null) {
    (0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.join(__dirname, "..", "..", "package.json")).then(it => {
        if (it.version === "0.0.0-semantic-release") {
            return;
        }
        const notifier = (0, (_updateNotifier || _load_updateNotifier()).default)({ pkg: it });
        if (notifier.update != null) {
            notifier.notify({
                message: `Update available ${(0, (_chalk || _load_chalk()).dim)(notifier.update.current)}${(0, (_chalk || _load_chalk()).reset)(" → ")}${(0, (_chalk || _load_chalk()).green)(notifier.update.latest)} \nRun ${(0, (_chalk || _load_chalk()).cyan)("npm i electron-builder --save-dev")} to update`
            });
        }
    }).catch(e => (0, (_log || _load_log()).warn)(`Cannot check updates: ${e}`));
}
(0, (_builder || _load_builder()).build)((0, (_cliOptions || _load_cliOptions()).createYargs)().argv).catch((_promise || _load_promise()).printErrorAndExit);
//# sourceMappingURL=build-cli.js.map