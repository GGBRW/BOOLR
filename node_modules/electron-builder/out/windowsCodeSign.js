"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getToolPath = exports.sign = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let sign = exports.sign = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (options) {
        let hashes = options.options.signingHashAlgorithms;
        // msi does not support dual-signing
        if (options.path.endsWith(".msi")) {
            hashes = [hashes != null && !(hashes.indexOf("sha1") !== -1) ? "sha256" : "sha1"];
        } else if (options.path.endsWith(".appx")) {
            hashes = ["sha256"];
        } else {
            if (hashes == null) {
                hashes = ["sha1", "sha256"];
            } else {
                hashes = Array.isArray(hashes) ? hashes.slice() : [hashes];
            }
        }
        const isWin = process.platform === "win32";
        let nest = false;
        //noinspection JSUnusedAssignment
        let outputPath = "";
        for (const hash of hashes) {
            outputPath = isWin ? options.path : getOutputPath(options.path, hash);
            yield spawnSign(options, options.path, outputPath, hash, nest);
            nest = true;
            if (!isWin) {
                yield (0, (_fsExtraP || _load_fsExtraP()).rename)(outputPath, options.path);
            }
        }
    });

    return function sign(_x) {
        return _ref.apply(this, arguments);
    };
})();
// on windows be aware of http://stackoverflow.com/a/32640183/1910191


let spawnSign = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (options, inputPath, outputPath, hash, nest) {
        const isWin = process.platform === "win32";
        const args = isWin ? ["sign"] : ["-in", inputPath, "-out", outputPath];
        if (process.env.ELECTRON_BUILDER_OFFLINE !== "true") {
            const timestampingServiceUrl = options.options.timeStampServer || "http://timestamp.verisign.com/scripts/timstamp.dll";
            if (isWin) {
                args.push(nest || hash === "sha256" ? "/tr" : "/t", nest || hash === "sha256" ? options.options.rfc3161TimeStampServer || "http://timestamp.comodoca.com/rfc3161" : timestampingServiceUrl);
            } else {
                args.push("-t", timestampingServiceUrl);
            }
        }
        const certificateFile = options.cert;
        if (certificateFile == null) {
            const subjectName = options.options.certificateSubjectName;
            if (process.platform !== "win32") {
                throw new Error(`${subjectName == null ? "certificateSha1" : "certificateSubjectName"} supported only on Windows`);
            }
            if (subjectName == null) {
                args.push("/sha1", options.options.certificateSha1);
            } else {
                args.push("/n", subjectName);
            }
        } else {
            const certExtension = _path.extname(certificateFile);
            if (certExtension === ".p12" || certExtension === ".pfx") {
                args.push(isWin ? "/f" : "-pkcs12", certificateFile);
            } else {
                throw new Error(`Please specify pkcs12 (.p12/.pfx) file, ${certificateFile} is not correct`);
            }
        }
        if (!isWin || hash !== "sha1") {
            args.push(isWin ? "/fd" : "-h", hash);
            if (isWin && process.env.ELECTRON_BUILDER_OFFLINE !== "true") {
                args.push("/td", "sha256");
            }
        }
        if (options.name) {
            args.push(isWin ? "/d" : "-n", options.name);
        }
        if (options.site) {
            args.push(isWin ? "/du" : "-i", options.site);
        }
        // msi does not support dual-signing
        if (nest) {
            args.push(isWin ? "/as" : "-nest");
        }
        if (options.password) {
            args.push(isWin ? "/p" : "-pass", options.password);
        }
        if (isWin) {
            // must be last argument
            args.push(inputPath);
        }
        return yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)((yield getToolPath()), args);
    });

    return function spawnSign(_x2, _x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
})();
// async function verify(options: any) {
//   const out = await exec(await getToolPath(options), [
//     "verify",
//     "-in", options.path,
//     "-require-leaf-hash", options.hash
//   ])
//   if (out.includes("No signature found.")) {
//     throw new Error("No signature found")
//   }
//   else if (out.includes("Leaf hash match: failed")) {
//     throw new Error("Leaf hash match failed")
//   }
// }


let getToolPath = exports.getToolPath = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        if (process.env.USE_SYSTEM_SIGNCODE) {
            return "osslsigncode";
        }
        const result = process.env.SIGNTOOL_PATH;
        if (result) {
            return result;
        }
        const vendorPath = yield getSignVendorPath();
        if (process.platform === "win32") {
            if ((0, (_os || _load_os()).release)().startsWith("6.")) {
                return _path.join(vendorPath, "windows-6", "signtool.exe");
            } else {
                return _path.join(vendorPath, "windows-10", process.arch, "signtool.exe");
            }
        } else if (process.platform === "darwin" && (_isCi || _load_isCi()).default) {
            return _path.join(vendorPath, process.platform, "ci", "osslsigncode");
        } else {
            return _path.join(vendorPath, process.platform, "osslsigncode");
        }
    });

    return function getToolPath() {
        return _ref3.apply(this, arguments);
    };
})();
//# sourceMappingURL=windowsCodeSign.js.map


exports.getSignVendorPath = getSignVendorPath;

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _binDownload;

function _load_binDownload() {
    return _binDownload = require("electron-builder-util/out/binDownload");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _isCi;

function _load_isCi() {
    return _isCi = _interopRequireDefault(require("is-ci"));
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TOOLS_VERSION = "1.7.0";
function getSignVendorPath() {
    //noinspection SpellCheckingInspection
    return (0, (_binDownload || _load_binDownload()).getBinFromBintray)("winCodeSign", TOOLS_VERSION, "a34a60e74d02b81d0303e498f03c70ce0133f908b671f62ec32896db5cd0a716");
}
function getOutputPath(inputPath, hash) {
    const extension = _path.extname(inputPath);
    return _path.join(_path.dirname(inputPath), `${_path.basename(inputPath, extension)}-signed-${hash}${extension}`);
}