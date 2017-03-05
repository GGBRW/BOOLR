"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PkgTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

exports.prepareProductBuildArgs = prepareProductBuildArgs;

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _codeSign;

function _load_codeSign() {
    return _codeSign = require("../codeSign");
}

var _mac;

function _load_mac() {
    return _mac = require("../packager/mac");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

// http://www.shanekirk.com/2013/10/creating-flat-packages-in-osx/
class PkgTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(packager, outDir) {
        super("pkg");
        this.packager = packager;
        this.outDir = outDir;
        this.options = this.packager.config.pkg || Object.create(null);
        this.installLocation = this.options.installLocation || "/Applications";
    }
    build(appPath, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this.packager;
            const options = _this.options;
            const appInfo = packager.appInfo;
            const keychainName = (yield packager.codeSigningInfo).keychainName;
            const certType = "Developer ID Installer";
            const identity = yield (0, (_codeSign || _load_codeSign()).findIdentity)(certType, options.identity || packager.platformSpecificBuildOptions.identity, keychainName);
            if (identity == null && packager.forceCodeSigning) {
                throw new Error(`Cannot find valid "${certType}" to sign standalone installer, please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing`);
            }
            const appOutDir = _this.outDir;
            const distInfo = _path.join(appOutDir, "distribution.xml");
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("productbuild", ["--synthesize", "--component", appPath, _this.installLocation, distInfo], {
                cwd: appOutDir
            });
            // to use --scripts, we must build .app bundle separately using pkgbuild
            // productbuild --scripts doesn't work (because scripts in this case not added to our package)
            // https://github.com/electron-userland/electron-osx-sign/issues/96#issuecomment-274986942
            const innerPackageFile = _path.join(appOutDir, `${(0, (_mac || _load_mac()).filterCFBundleIdentifier)(appInfo.id)}.pkg`);
            yield _this.buildComponentPackage(appPath, innerPackageFile);
            const outFile = _path.join(appOutDir, packager.expandArtifactNamePattern(options, "pkg"));
            const args = prepareProductBuildArgs(identity, keychainName);
            args.push("--distribution", distInfo);
            args.push(outFile);
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(options.productbuild, function (it) {
                return args.push.apply(args, _toConsumableArray(it));
            });
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("productbuild", args, {
                cwd: appOutDir
            });
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_fsExtraP || _load_fsExtraP()).unlink)(innerPackageFile), (0, (_fsExtraP || _load_fsExtraP()).unlink)(distInfo)]);
            packager.dispatchArtifactCreated(outFile, _this, `${appInfo.name}-${appInfo.version}.pkg`);
        })();
    }
    buildComponentPackage(appPath, outFile) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const options = _this2.options;
            const args = ["--component", appPath, "--install-location", _this2.installLocation];
            if (options.scripts != null) {
                args.push("--scripts", _path.resolve(_this2.packager.buildResourcesDir, options.scripts));
            } else if (options.scripts !== null) {
                const dir = _path.join(_this2.packager.buildResourcesDir, "pkg-scripts");
                const stat = yield (0, (_fs || _load_fs()).statOrNull)(dir);
                if (stat != null && stat.isDirectory()) {
                    args.push("--scripts", dir);
                }
            }
            args.push(outFile);
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("pkgbuild", args);
        })();
    }
}
exports.PkgTarget = PkgTarget;
function prepareProductBuildArgs(identity, keychain) {
    const args = [];
    if (identity != null) {
        args.push("--sign", identity);
        if (keychain != null) {
            args.push("--keychain", keychain);
        }
    }
    return args;
}
//# sourceMappingURL=pkg.js.map