"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FileMatcher = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

exports.copyFiles = copyFiles;

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

var _minimatch;

function _load_minimatch() {
    return _minimatch = require("minimatch");
}

var _path = _interopRequireWildcard(require("path"));

var _filter;

function _load_filter() {
    return _filter = require("./util/filter");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FileMatcher {
    constructor(from, to, macroExpander, patterns) {
        this.macroExpander = macroExpander;
        this.from = macroExpander(from);
        this.to = macroExpander(to);
        this.patterns = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(patterns).map(it => _path.posix.normalize(macroExpander(it)));
    }
    addPattern(pattern) {
        this.patterns.push(_path.posix.normalize(this.macroExpander(pattern)));
    }
    addAllPattern() {
        // must be first, see minimatchAll implementation
        this.patterns.unshift("**/*");
    }
    isEmpty() {
        return this.patterns.length === 0;
    }
    containsOnlyIgnore() {
        return !this.isEmpty() && this.patterns.find(it => !it.startsWith("!")) == null;
    }
    computeParsedPatterns(result, fromDir) {
        // https://github.com/electron-userland/electron-builder/issues/733
        const minimatchOptions = { dot: true };
        const relativeFrom = fromDir == null ? null : _path.relative(fromDir, this.from);
        if (this.patterns.length === 0 && relativeFrom != null) {
            // file mappings, from here is a file
            result.push(new (_minimatch || _load_minimatch()).Minimatch(relativeFrom, minimatchOptions));
            return;
        }
        for (let pattern of this.patterns) {
            if (relativeFrom != null) {
                pattern = _path.join(relativeFrom, pattern);
            }
            const parsedPattern = new (_minimatch || _load_minimatch()).Minimatch(pattern, minimatchOptions);
            result.push(parsedPattern);
            if (!(0, (_filter || _load_filter()).hasMagic)(parsedPattern)) {
                // https://github.com/electron-userland/electron-builder/issues/545
                // add **/*
                result.push(new (_minimatch || _load_minimatch()).Minimatch(`${pattern}/**/*`, minimatchOptions));
            }
        }
    }
    createFilter(ignoreFiles, rawFilter, excludePatterns) {
        const parsedPatterns = [];
        this.computeParsedPatterns(parsedPatterns);
        return (0, (_filter || _load_filter()).createFilter)(this.from, parsedPatterns, ignoreFiles, rawFilter, excludePatterns);
    }
}
exports.FileMatcher = FileMatcher;
function copyFiles(patterns) {
    if (patterns == null || patterns.length === 0) {
        return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve();
    }
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.map(patterns, (() => {
        var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (pattern) {
            const fromStat = yield (0, (_fs || _load_fs()).statOrNull)(pattern.from);
            if (fromStat == null) {
                (0, (_log || _load_log()).warn)(`File source ${pattern.from} doesn't exist`);
                return;
            }
            if (fromStat.isFile()) {
                const toStat = yield (0, (_fs || _load_fs()).statOrNull)(pattern.to);
                // https://github.com/electron-userland/electron-builder/issues/1245
                if (toStat != null && toStat.isDirectory()) {
                    return yield (0, (_fs || _load_fs()).copyFile)(pattern.from, _path.join(pattern.to, _path.basename(pattern.from)), fromStat);
                }
                yield (0, (_fsExtraP || _load_fsExtraP()).mkdirs)(_path.dirname(pattern.to));
                return yield (0, (_fs || _load_fs()).copyFile)(pattern.from, pattern.to, fromStat);
            }
            if (pattern.isEmpty() || pattern.containsOnlyIgnore()) {
                pattern.addAllPattern();
            }
            return yield (0, (_fs || _load_fs()).copyDir)(pattern.from, pattern.to, pattern.createFilter());
        });

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    })());
}
//# sourceMappingURL=fileMatcher.js.map