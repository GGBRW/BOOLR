"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

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

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

var _sanitizeFilename;

function _load_sanitizeFilename() {
    return _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
}

var _windowsCodeSign;

function _load_windowsCodeSign() {
    return _windowsCodeSign = require("../windowsCodeSign");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

class AppXTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(packager, outDir) {
        super("appx");
        this.packager = packager;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config.appx);
        const osVersion = (0, (_os || _load_os()).release)();
        if (process.platform !== "win32" || parseInt(osVersion.substring(0, osVersion.indexOf(".")), 10) < 10) {
            throw new Error("AppX is supported only on Windows 10");
        }
    }
    // no flatten - use asar or npm 3 or yarn
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this.packager;
            if ((yield packager.cscInfo) == null) {
                throw new Error("AppX package must be signed, but certificate is not set, please see https://github.com/electron-userland/electron-builder/wiki/Code-Signing");
            }
            let publisher = _this.options.publisher;
            if (publisher == null) {
                const computed = yield packager.computedPublisherName.value;
                if (computed != null) {
                    publisher = `CN=${computed[0]}`;
                }
                if (publisher == null) {
                    throw new Error("Please specify appx.publisher");
                }
            }
            const appInfo = packager.appInfo;
            const preAppx = _path.join(_this.outDir, `pre-appx-${(0, (_electronBuilderCore || _load_electronBuilderCore()).getArchSuffix)(arch)}`);
            yield (0, (_fsExtraP || _load_fsExtraP()).emptyDir)(preAppx);
            const vendorPath = yield (0, (_windowsCodeSign || _load_windowsCodeSign()).getSignVendorPath)();
            const templatePath = _path.join(__dirname, "..", "..", "templates", "appx");
            const safeName = (0, (_sanitizeFilename || _load_sanitizeFilename()).default)(appInfo.name);
            const resourceList = yield packager.resourceList;
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(_bluebirdLst2 || _load_bluebirdLst2()).default.map(["44x44", "50x50", "150x150", "310x150"], function (size) {
                const target = _path.join(preAppx, "assets", `${safeName}.${size}.png`);
                if (resourceList.indexOf(`${size}.png`) !== -1) {
                    return (0, (_fsExtraP || _load_fsExtraP()).copy)(_path.join(packager.buildResourcesDir, `${size}.png`), target);
                }
                return (0, (_fsExtraP || _load_fsExtraP()).copy)(_path.join(vendorPath, "appxAssets", `SampleAppx.${size}.png`), target);
            }), (0, (_fs || _load_fs()).copyDir)(appOutDir, _path.join(preAppx, "app")), _this.writeManifest(templatePath, preAppx, safeName, arch, publisher)]);
            const destination = _path.join(_this.outDir, packager.generateName("appx", arch, false));
            const args = ["pack", "/o", "/d", preAppx, "/p", destination];
            (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(_this.options.makeappxArgs, function (it) {
                return args.push.apply(args, _toConsumableArray(it));
            });
            // wine supports only ia32 binary in any case makeappx crashed on wine
            // await execWine(path.join(await getSignVendorPath(), "windows-10", process.platform === "win32" ? process.arch : "ia32", "makeappx.exe"), args)
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)(_path.join(vendorPath, "windows-10", arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32 ? "ia32" : "x64", "makeappx.exe"), args);
            yield packager.sign(destination);
            packager.dispatchArtifactCreated(destination, _this, packager.generateName("appx", arch, true));
        })();
    }
    writeManifest(templatePath, preAppx, safeName, arch, publisher) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const appInfo = _this2.packager.appInfo;
            const manifest = (yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_path.join(templatePath, "appxmanifest.xml"), "utf8")).replace(/\$\{([a-zA-Z]+)\}/g, function (match, p1) {
                switch (p1) {
                    case "publisher":
                        return publisher;
                    case "publisherDisplayName":
                        return _this2.options.publisherDisplayName || appInfo.companyName;
                    case "version":
                        return appInfo.versionInWeirdWindowsForm;
                    case "name":
                        return appInfo.name;
                    case "identityName":
                        return _this2.options.identityName || appInfo.name;
                    case "executable":
                        return `app\\${appInfo.productFilename}.exe`;
                    case "displayName":
                        return _this2.options.displayName || appInfo.productName;
                    case "description":
                        return appInfo.description || appInfo.productName;
                    case "backgroundColor":
                        return _this2.options.backgroundColor || "#464646";
                    case "safeName":
                        return safeName;
                    case "arch":
                        return arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32 ? "x86" : "x64";
                    default:
                        throw new Error(`Macro ${p1} is not defined`);
                }
            });
            yield (0, (_fsExtraP || _load_fsExtraP()).writeFile)(_path.join(preAppx, "appxmanifest.xml"), manifest);
        })();
    }
}
exports.default = AppXTarget; //# sourceMappingURL=appx.js.map