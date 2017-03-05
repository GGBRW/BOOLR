"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unpackElectron = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let unpackElectron = exports.unpackElectron = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (packager, out, platform, arch, electronVersion) {
        const electronDist = packager.config.electronDist;
        if (electronDist == null) {
            const zipPath = (yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([downloadElectron(createDownloadOpts(packager.config, platform, arch, electronVersion)), (0, (_fsExtraP || _load_fsExtraP()).emptyDir)(out)]))[0];
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)((_zipBin || _load_zipBin()).path7za, (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug7zArgs)("x").concat(zipPath, `-o${out}`));
        } else {
            yield (0, (_fsExtraP || _load_fsExtraP()).emptyDir)(out);
            yield (0, (_fs || _load_fs()).copyDir)(_path.resolve(packager.info.projectDir, electronDist, "Electron.app"), _path.join(out, "Electron.app"));
        }
        if (platform === "linux") {
            // https://github.com/electron-userland/electron-builder/issues/786
            // fix dir permissions — opposite to extract-zip, 7za creates dir with no-access for other users, but dir must be readable for non-root users
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_fsExtraP || _load_fsExtraP()).chmod)(_path.join(out, "locales"), "0755"), (0, (_fsExtraP || _load_fsExtraP()).chmod)(_path.join(out, "resources"), "0755")]);
        }
    });

    return function unpackElectron(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=dirPackager.js.map


var _zipBin;

function _load_zipBin() {
    return _zipBin = require("7zip-bin");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const downloadElectron = (_bluebirdLst2 || _load_bluebirdLst2()).default.promisify(require("electron-download-tf"));
function createDownloadOpts(opts, platform, arch, electronVersion) {
    if (opts.download != null) {
        (0, (_log || _load_log()).warn)(`"build.download is deprecated — please use build.electronDownload instead`);
    }
    const downloadOpts = Object.assign({
        cache: opts.cache,
        strictSSL: opts["strict-ssl"]
    }, opts.electronDownload || opts.download);
    subOptionWarning(downloadOpts, "download", "platform", platform);
    subOptionWarning(downloadOpts, "download", "arch", arch);
    subOptionWarning(downloadOpts, "download", "version", electronVersion);
    return downloadOpts;
}
function subOptionWarning(properties, optionName, parameter, value) {
    if (properties.hasOwnProperty(parameter)) {
        (0, (_log || _load_log()).warn)(`${optionName}.${parameter} will be inferred from the main options`);
    }
    properties[parameter] = value;
}