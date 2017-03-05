"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FileCopier = exports.walk = exports.exists = exports.statOrNull = exports.CONCURRENCY = exports.MAX_FILE_REQUESTS = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let statOrNull = exports.statOrNull = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (file) {
        try {
            return yield (0, (_fsExtraP || _load_fsExtraP()).stat)(file);
        } catch (e) {
            if (e.code === "ENOENT") {
                return null;
            } else {
                throw e;
            }
        }
    });

    return function statOrNull(_x) {
        return _ref.apply(this, arguments);
    };
})();

let exists = exports.exists = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (file) {
        try {
            yield (0, (_fsExtraP || _load_fsExtraP()).access)(file);
            return true;
        } catch (e) {
            return false;
        }
    });

    return function exists(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

let walk = exports.walk = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (initialDirPath, filter, consumer) {
        const result = [];
        const queue = [initialDirPath];
        let addDirToResult = false;
        while (queue.length > 0) {
            const dirPath = queue.pop();
            if (addDirToResult) {
                result.push(dirPath);
            } else {
                addDirToResult = true;
            }
            const childNames = yield (0, (_fsExtraP || _load_fsExtraP()).readdir)(dirPath);
            childNames.sort();
            const dirs = [];
            // our handler is async, but we should add sorted files, so, we add file to result not in the mapper, but after map
            const sortedFilePaths = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(childNames, function (name) {
                const filePath = dirPath + _path.sep + name;
                return (0, (_fsExtraP || _load_fsExtraP()).lstat)(filePath).then(function (stat) {
                    if (filter != null && !filter(filePath, stat)) {
                        return null;
                    }
                    const consumerResult = consumer == null ? null : consumer(filePath, stat, dirPath);
                    if (consumerResult == null || !("then" in consumerResult)) {
                        if (stat.isDirectory()) {
                            dirs.push(name);
                            return null;
                        } else {
                            return filePath;
                        }
                    } else {
                        return consumerResult.then(function (it) {
                            // asarUtil can return modified stat (symlink handling)
                            if ((it != null && "isDirectory" in it ? it : stat).isDirectory()) {
                                dirs.push(name);
                                return null;
                            } else {
                                return filePath;
                            }
                        });
                    }
                });
            }, CONCURRENCY);
            for (const child of sortedFilePaths) {
                if (child != null) {
                    result.push(child);
                }
            }
            dirs.sort();
            for (const child of dirs) {
                queue.push(dirPath + _path.sep + child);
            }
        }
        return result;
    });

    return function walk(_x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

exports.unlinkIfExists = unlinkIfExists;
exports.copyFile = copyFile;
exports.copyDir = copyDir;

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _isCi;

function _load_isCi() {
    return _isCi = _interopRequireDefault(require("is-ci"));
}

var _path = _interopRequireWildcard(require("path"));

var _statMode;

function _load_statMode() {
    return _statMode = _interopRequireDefault(require("stat-mode"));
}

var _util;

function _load_util() {
    return _util = require("./util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_FILE_REQUESTS = exports.MAX_FILE_REQUESTS = 8;
const CONCURRENCY = exports.CONCURRENCY = { concurrency: MAX_FILE_REQUESTS };
function unlinkIfExists(file) {
    return (0, (_fsExtraP || _load_fsExtraP()).unlink)(file).catch(() => {});
}

const _isUseHardLink = process.platform != "win32" && process.env.USE_HARD_LINKS !== "false" && ((_isCi || _load_isCi()).default || process.env.USE_HARD_LINKS === "true");
/**
 * Hard links is used if supported and allowed.
 * File permission is fixed — allow execute for all if owner can, allow read for all if owner can.
 */
function copyFile(src, dest, stats) {
    let isUseHardLink = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _isUseHardLink;

    if (stats != null) {
        const originalModeNumber = stats.mode;
        const mode = new (_statMode || _load_statMode()).default(stats);
        if (mode.owner.execute) {
            mode.group.execute = true;
            mode.others.execute = true;
        }
        mode.group.read = true;
        mode.others.read = true;
        if (originalModeNumber !== stats.mode) {
            if ((_util || _load_util()).debug.enabled) {
                const oldMode = new (_statMode || _load_statMode()).default(Object.assign({}, stats, { mode: originalModeNumber }));
                (0, (_util || _load_util()).debug)(`${dest} permissions fixed from ${oldMode.toOctal()} (${oldMode.toString()}) to ${mode.toOctal()} (${mode.toString()})`);
            }
            // https://helgeklein.com/blog/2009/05/hard-links-and-permissions-acls/
            // Permissions on all hard links to the same data on disk are always identical. The same applies to attributes.
            // That means if you change the permissions/owner/attributes on one hard link, you will immediately see the changes on all other hard links.
            if (isUseHardLink) {
                isUseHardLink = false;
                (0, (_util || _load_util()).debug)(`${dest} will be copied, but not linked, because file permissions need to be fixed`);
            }
        }
    }
    if (isUseHardLink) {
        return (0, (_fsExtraP || _load_fsExtraP()).link)(src, dest);
    }
    return new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
        const readStream = (0, (_fsExtraP || _load_fsExtraP()).createReadStream)(src);
        const writeStream = (0, (_fsExtraP || _load_fsExtraP()).createWriteStream)(dest, stats == null ? undefined : { mode: stats.mode });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("open", function () {
            readStream.pipe(writeStream);
        });
        writeStream.once("close", resolve);
    });
}
class FileCopier {
    constructor(isUseHardLinkFunction) {
        let isUseHardLink = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _isUseHardLink;

        this.isUseHardLinkFunction = isUseHardLinkFunction;
        this.isUseHardLink = isUseHardLink;
    }
    copy(src, dest, stat) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            try {
                yield copyFile(src, dest, stat, !_this.isUseHardLink || _this.isUseHardLinkFunction == null ? _this.isUseHardLink : _this.isUseHardLinkFunction(dest));
            } catch (e) {
                // files are copied concurrently, so, we must not check here currentIsUseHardLink — our code can be executed after that other handler will set currentIsUseHardLink to false
                if (e.code === "EXDEV") {
                    // ...but here we want to avoid excess debug log message
                    if (_this.isUseHardLink) {
                        (0, (_util || _load_util()).debug)(`Cannot copy using hard link: ${e}`);
                        _this.isUseHardLink = false;
                    }
                    yield copyFile(src, dest, stat, false);
                } else {
                    throw e;
                }
            }
        })();
    }
}
exports.FileCopier = FileCopier; /**
                                  * Empty directories is never created.
                                  * Hard links is used if supported and allowed.
                                  */

function copyDir(src, destination, filter, isUseHardLink) {
    if ((_util || _load_util()).debug.enabled) {
        (0, (_util || _load_util()).debug)(`Copying ${src} to ${destination}${_isUseHardLink ? " using hard links" : ""}`);
    }
    const createdSourceDirs = new Set();
    const fileCopier = new FileCopier(isUseHardLink);
    const links = [];
    return walk(src, filter, (() => {
        var _ref4 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (file, stat, parent) {
            if (!stat.isFile() && !stat.isSymbolicLink()) {
                return;
            }
            if (!createdSourceDirs.has(parent)) {
                yield (0, (_fsExtraP || _load_fsExtraP()).mkdirs)(parent.replace(src, destination));
                createdSourceDirs.add(parent);
            }
            const destFile = file.replace(src, destination);
            if (stat.isFile()) {
                yield fileCopier.copy(file, destFile, stat);
            } else {
                links.push({ "file": destFile, "link": yield (0, (_fsExtraP || _load_fsExtraP()).readlink)(file) });
            }
        });

        return function (_x8, _x9, _x10) {
            return _ref4.apply(this, arguments);
        };
    })()).then(() => (_bluebirdLst2 || _load_bluebirdLst2()).default.map(links, it => (0, (_fsExtraP || _load_fsExtraP()).symlink)(it.link, it.file), CONCURRENCY));
}
//# sourceMappingURL=fs.js.map