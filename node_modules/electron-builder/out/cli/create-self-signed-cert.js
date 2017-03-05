"use strict";

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let main = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        const args = (_yargs || _load_yargs()).default.option("publisher", {
            alias: ["p"]
        }).argv;
        const tmpDir = new (_tmp || _load_tmp()).TmpDir();
        const targetDir = process.cwd();
        const tempPrefix = _path.join((yield tmpDir.getTempFile("")), (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(args.publisher));
        const cer = `${tempPrefix}.cer`;
        const pvk = `${tempPrefix}.pvk`;
        (0, (_log || _load_log()).log)('When asked to enter a password ("Create Private Key Password"), please select "None".');
        const vendorPath = _path.join((yield (0, (_windowsCodeSign || _load_windowsCodeSign()).getSignVendorPath)()), "windows-10", process.arch);
        yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(_path.join(vendorPath, "makecert.exe"), ["-r", "-h", "0", "-n", `CN=${args.publisher}`, "-eku", "1.3.6.1.5.5.7.3.3", "-pe", "-sv", pvk, cer]);
        const pfx = _path.join(targetDir, `${(0, (_sanitizeFilename || _load_sanitizeFilename()).default)(args.publisher)}.pfx`);
        yield (0, (_fs || _load_fs()).unlinkIfExists)(pfx);
        yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)(_path.join(vendorPath, "pvk2pfx.exe"), ["-pvk", pvk, "-spc", cer, "-pfx", pfx]);
        (0, (_log || _load_log()).log)(`${pfx} created. Please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing how do use it to sign.`);
        const certLocation = "Cert:\\LocalMachine\\TrustedPeople";
        (0, (_log || _load_log()).log)(`${pfx} will be imported into ${certLocation} Operation will be succeed only if runned from root. Otherwise import file manually.`);
        yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)("powershell.exe", ["Import-PfxCertificate", "-FilePath", `"${pfx}"`, "-CertStoreLocation", ""]);
        yield tmpDir.cleanup();
    });

    return function main() {
        return _ref.apply(this, arguments);
    };
})();

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

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
}

var _tmp;

function _load_tmp() {
    return _tmp = require("electron-builder-util/out/tmp");
}

var _path = _interopRequireWildcard(require("path"));

var _sanitizeFilename;

function _load_sanitizeFilename() {
    return _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
}

var _yargs;

function _load_yargs() {
    return _yargs = _interopRequireDefault(require("yargs"));
}

var _windowsCodeSign;

function _load_windowsCodeSign() {
    return _windowsCodeSign = require("../windowsCodeSign");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

main().catch((_promise || _load_promise()).printErrorAndExit);
//# sourceMappingURL=create-self-signed-cert.js.map