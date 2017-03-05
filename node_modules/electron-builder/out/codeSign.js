"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findIdentityRawResult = exports.createKeychain = exports.downloadCertificate = exports.appleCertificatePrefixes = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let downloadCertificate = exports.downloadCertificate = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (urlOrBase64, tmpDir) {
        let file = null;
        if (urlOrBase64.length > 3 && urlOrBase64[1] === ":" || urlOrBase64.startsWith("/")) {
            file = urlOrBase64;
        } else if (urlOrBase64.startsWith("file://")) {
            file = urlOrBase64.substring("file://".length);
        } else if (urlOrBase64.startsWith("~/")) {
            file = _path.join((0, (_os || _load_os()).homedir)(), urlOrBase64.substring("~/".length));
        } else {
            const tempFile = yield tmpDir.getTempFile(".p12");
            if (urlOrBase64.startsWith("https://")) {
                yield (0, (_electronBuilderHttp || _load_electronBuilderHttp()).download)(urlOrBase64, tempFile);
            } else {
                yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(tempFile, new Buffer(urlOrBase64, "base64"));
            }
            return tempFile;
        }
        const stat = yield (0, (_fs || _load_fs()).statOrNull)(file);
        if (stat == null) {
            throw new Error(`${file} doesn't exist`);
        } else if (!stat.isFile()) {
            throw new Error(`${file} not a file`);
        } else {
            return file;
        }
    });

    return function downloadCertificate(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

// "Note that filename will not be searched to resolve the signing identity's certificate chain unless it is also on the user's keychain search list."
// but "security list-keychains" doesn't support add - we should 1) get current list 2) set new list - it is very bad http://stackoverflow.com/questions/10538942/add-a-keychain-to-search-list
// "overly complicated and introduces a race condition."
// https://github.com/electron-userland/electron-builder/issues/398
let createCustomCertKeychain = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        // copy to temp and then atomic rename to final path
        const tmpKeychainPath = _path.join((0, (_electronBuilderUtil || _load_electronBuilderUtil()).getCacheDirectory)(), (0, (_electronBuilderUtil || _load_electronBuilderUtil()).getTempName)("electron-builder-root-certs"));
        const keychainPath = _path.join((0, (_electronBuilderUtil || _load_electronBuilderUtil()).getCacheDirectory)(), "electron-builder-root-certs.keychain");
        const results = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", ["list-keychains"]), (0, (_fsExtraP || _load_fsExtraP()).copy)(_path.join(__dirname, "..", "certs", "root_certs.keychain"), tmpKeychainPath).then(function () {
            return (0, (_fsExtraP || _load_fsExtraP()).rename)(tmpKeychainPath, keychainPath);
        })]);
        const list = results[0].split("\n").map(function (it) {
            const r = it.trim();
            return r.substring(1, r.length - 1);
        }).filter(function (it) {
            return it.length > 0;
        });
        if (!(list.indexOf(keychainPath) !== -1)) {
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", ["list-keychains", "-d", "user", "-s", keychainPath].concat(list));
        }
    });

    return function createCustomCertKeychain() {
        return _ref2.apply(this, arguments);
    };
})();

let createKeychain = exports.createKeychain = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (tmpDir, cscLink, cscKeyPassword, cscILink, cscIKeyPassword) {
        if (bundledCertKeychainAdded == null) {
            bundledCertKeychainAdded = createCustomCertKeychain();
        }
        yield bundledCertKeychainAdded;
        const keychainName = yield tmpDir.getTempFile(".keychain");
        const certLinks = [cscLink];
        if (cscILink != null) {
            certLinks.push(cscILink);
        }
        const certPaths = new Array(certLinks.length);
        const keychainPassword = (0, (_crypto || _load_crypto()).randomBytes)(8).toString("hex");
        return yield (0, (_promise || _load_promise()).executeFinally)((_bluebirdLst2 || _load_bluebirdLst2()).default.all([(_bluebirdLst2 || _load_bluebirdLst2()).default.map(certLinks, function (link, i) {
            return downloadCertificate(link, tmpDir).then(function (it) {
                return certPaths[i] = it;
            });
        }), (_bluebirdLst2 || _load_bluebirdLst2()).default.mapSeries([["create-keychain", "-p", keychainPassword, keychainName], ["unlock-keychain", "-p", keychainPassword, keychainName], ["set-keychain-settings", "-t", "3600", "-u", keychainName]], function (it) {
            return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", it);
        })]).then(function () {
            return importCerts(keychainName, certPaths, [cscKeyPassword, cscIKeyPassword].filter(function (it) {
                return it != null;
            }));
        }), function () {
            return (0, (_promise || _load_promise()).all)(certPaths.map(function (it, index) {
                return certLinks[index].startsWith("https://") ? (0, (_fsExtraP || _load_fsExtraP()).deleteFile)(it, true) : (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve();
            }));
        });
    });

    return function createKeychain(_x3, _x4, _x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
})();

let importCerts = (() => {
    var _ref4 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (keychainName, paths, keyPasswords) {
        for (let i = 0; i < paths.length; i++) {
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", ["import", paths[i], "-k", keychainName, "-T", "/usr/bin/codesign", "-T", "/usr/bin/productbuild", "-P", keyPasswords[i]]);
        }
        return {
            keychainName: keychainName
        };
    });

    return function importCerts(_x8, _x9, _x10) {
        return _ref4.apply(this, arguments);
    };
})();

let getValidIdentities = (() => {
    var _ref5 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (keychain) {
        function addKeychain(args) {
            if (keychain != null) {
                args.push(keychain);
            }
            return args;
        }
        let result = findIdentityRawResult;
        if (result == null || keychain != null) {
            // https://github.com/electron-userland/electron-builder/issues/481
            // https://github.com/electron-userland/electron-builder/issues/535
            result = (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", addKeychain(["find-identity", "-v"])).then(function (it) {
                return it.trim().split("\n").filter(function (it) {
                    for (const prefix of appleCertificatePrefixes) {
                        if (it.indexOf(prefix) !== -1) {
                            return true;
                        }
                    }
                    return false;
                });
            }), (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("security", addKeychain(["find-identity", "-v", "-p", "codesigning"])).then(function (it) {
                return it.trim().split("\n");
            })]).then(function (it) {
                const array = it[0].concat(it[1]).filter(function (it) {
                    return !(it.indexOf("(Missing required extension)") !== -1) && !(it.indexOf("valid identities found") !== -1) && !(it.indexOf("iPhone ") !== -1) && !(it.indexOf("com.apple.idms.appleid.prd.") !== -1);
                }).map(function (it) {
                    return it.substring(it.indexOf(")") + 1).trim();
                });
                return Array.from(new Set(array));
            });
            if (keychain == null) {
                exports.findIdentityRawResult = findIdentityRawResult = result;
            }
        }
        return result;
    });

    return function getValidIdentities(_x11) {
        return _ref5.apply(this, arguments);
    };
})();

let _findIdentity = (() => {
    var _ref6 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (type, qualifier, keychain) {
        // https://github.com/electron-userland/electron-builder/issues/484
        //noinspection SpellCheckingInspection
        const lines = yield getValidIdentities(keychain);
        const namePrefix = `${type}:`;
        for (const line of lines) {
            if (qualifier != null && !(line.indexOf(qualifier) !== -1)) {
                continue;
            }
            if (line.indexOf(namePrefix) !== -1) {
                return line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
            }
        }
        if (type === "Developer ID Application") {
            // find non-Apple certificate
            // https://github.com/electron-userland/electron-builder/issues/458
            l: for (const line of lines) {
                if (qualifier != null && !(line.indexOf(qualifier) !== -1)) {
                    continue;
                }
                if (line.indexOf("Mac Developer:") !== -1) {
                    continue;
                }
                for (const prefix of appleCertificatePrefixes) {
                    if (line.indexOf(prefix) !== -1) {
                        continue l;
                    }
                }
                return line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
            }
        }
        return null;
    });

    return function _findIdentity(_x12, _x13, _x14) {
        return _ref6.apply(this, arguments);
    };
})();

exports.sign = sign;
exports.findIdentity = findIdentity;

var _crypto;

function _load_crypto() {
    return _crypto = require("crypto");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _fs;

function _load_fs() {
    return _fs = require("electron-builder-util/out/fs");
}

var _promise;

function _load_promise() {
    return _promise = require("electron-builder-util/out/promise");
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

const appleCertificatePrefixes = exports.appleCertificatePrefixes = ["Developer ID Application:", "Developer ID Installer:", "3rd Party Mac Developer Application:", "3rd Party Mac Developer Installer:"];

let bundledCertKeychainAdded = null;function sign(path, name, keychain) {
    const args = ["--deep", "--force", "--sign", name, path];
    if (keychain != null) {
        args.push("--keychain", keychain);
    }
    return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).exec)("codesign", args);
}
let findIdentityRawResult = exports.findIdentityRawResult = null;
function findIdentity(certType, qualifier, keychain) {
    let identity = qualifier || process.env.CSC_NAME;
    if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(identity)) {
        if (keychain == null && !(_isCi || _load_isCi()).default && process.env.CSC_IDENTITY_AUTO_DISCOVERY === "false") {
            return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(null);
        } else {
            return _findIdentity(certType, null, keychain);
        }
    } else {
        identity = identity.trim();
        for (const prefix of appleCertificatePrefixes) {
            checkPrefix(identity, prefix);
        }
        return _findIdentity(certType, identity, keychain);
    }
}
function checkPrefix(name, prefix) {
    if (name.startsWith(prefix)) {
        throw new Error(`Please remove prefix "${prefix}" from the specified name — appropriate certificate will be chosen automatically`);
    }
}
//# sourceMappingURL=codeSign.js.map