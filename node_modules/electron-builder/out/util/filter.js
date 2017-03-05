"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasMagic = hasMagic;
exports.createFilter = createFilter;

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function hasMagic(pattern) {
    const set = pattern.set;
    if (set.length > 1) {
        return true;
    }
    for (const i of set[0]) {
        if (typeof i !== "string") {
            return true;
        }
    }
    return false;
}
function createFilter(src, patterns, ignoreFiles, rawFilter, excludePatterns) {
    return function (it, stat) {
        if (src === it) {
            return true;
        }
        if (rawFilter != null && !rawFilter(it)) {
            return false;
        }
        // yes, check before path sep normalization
        if (ignoreFiles != null && ignoreFiles.has(it)) {
            return false;
        }
        let relative = it.substring(src.length + 1);
        if (_path.sep === "\\") {
            relative = relative.replace(/\\/g, "/");
        }
        return minimatchAll(relative, patterns, stat) && (excludePatterns == null || !minimatchAll(relative, excludePatterns, stat));
    };
}
// https://github.com/joshwnj/minimatch-all/blob/master/index.js
function minimatchAll(path, patterns, stat) {
    let match = false;
    for (const pattern of patterns) {
        // If we've got a match, only re-test for exclusions.
        // if we don't have a match, only re-test for inclusions.
        if (match !== pattern.negate) {
            continue;
        }
        // partial match — pattern: foo/bar.txt path: foo — we must allow foo
        // use it only for non-negate patterns: const m = new Minimatch("!node_modules/@(electron-download|electron)/**/*", {dot: true }); m.match("node_modules", true) will return false, but must be true
        match = pattern.match(path, stat.isDirectory() && !pattern.negate);
    }
    return match;
}
//# sourceMappingURL=filter.js.map