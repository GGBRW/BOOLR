"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readInstalled = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let readInstalled = exports.readInstalled = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (folder) {
        const opts = {
            depth: Infinity,
            dev: false
        };
        const findUnmetSeen = new Set();
        const pathToDep = new Map();
        const obj = yield _readInstalled(folder, null, null, 0, opts, pathToDep, findUnmetSeen);
        unmarkExtraneous(obj, opts.dev, true);
        return pathToDep;
    });

    return function readInstalled(_x) {
        return _ref.apply(this, arguments);
    };
})();

let _readInstalled = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (folder, parent, name, depth, opts, realpathSeen, findUnmetSeen) {
        const realDir = yield (0, (_fsExtraP || _load_fsExtraP()).realpath)(folder);
        const processed = realpathSeen.get(realDir);
        if (processed != null) {
            return processed;
        }
        const obj = yield (0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.resolve(folder, "package.json"));
        obj.realPath = realDir;
        obj.path = obj.path || folder;
        //noinspection ES6MissingAwait
        if ((yield (0, (_fsExtraP || _load_fsExtraP()).lstat)(folder)).isSymbolicLink()) {
            obj.link = realDir;
        }
        obj.realName = name || obj.name;
        obj.dependencyNames = obj.dependencies == null ? null : new Set(Object.keys(obj.dependencies));
        // Mark as extraneous at this point.
        // This will be un-marked in unmarkExtraneous, where we mark as not-extraneous everything that is required in some way from the root object.
        obj.extraneous = true;
        obj.optional = true;
        if (parent != null && obj.link == null) {
            obj.parent = parent;
        }
        realpathSeen.set(realDir, obj);
        if (depth > opts.depth) {
            return obj;
        }
        const deps = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map((yield readScopedDir(_path.join(folder, "node_modules"))), function (pkg) {
            return _readInstalled(_path.join(folder, "node_modules", pkg), obj, pkg, depth + 1, opts, realpathSeen, findUnmetSeen);
        }, { concurrency: 8 });
        if (obj.dependencies != null) {
            for (const dep of deps) {
                obj.dependencies[dep.realName] = dep;
            }
            // any strings in the obj.dependencies are unmet deps. However, if it's optional, then that's fine, so just delete it.
            if (obj.optionalDependencies != null) {
                for (const dep of Object.keys(obj.optionalDependencies)) {
                    if (typeof obj.dependencies[dep] === "string") {
                        delete obj.dependencies[dep];
                    }
                }
            }
        }
        return obj;
    });

    return function _readInstalled(_x2, _x3, _x4, _x5, _x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
    };
})();

let readScopedDir = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (dir) {
        let files;
        try {
            files = (yield (0, (_fsExtraP || _load_fsExtraP()).readdir)(dir)).filter(function (it) {
                return !it.startsWith(".");
            });
        } catch (e) {
            // error indicates that nothing is installed here
            return [];
        }
        files.sort();
        const scopes = files.filter(function (it) {
            return it.startsWith("@");
        });
        if (scopes.length === 0) {
            return files;
        }
        const result = files.filter(function (it) {
            return !it.startsWith("@");
        });
        const scopeFileList = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(scopes, function (it) {
            return (0, (_fsExtraP || _load_fsExtraP()).readdir)(_path.join(dir, it));
        });
        for (let i = 0; i < scopes.length; i++) {
            for (const file of scopeFileList[i]) {
                if (!file.startsWith(".")) {
                    result.push(`${scopes[i]}/${file}`);
                }
            }
        }
        result.sort();
        return result;
    });

    return function readScopedDir(_x9) {
        return _ref3.apply(this, arguments);
    };
})();
//# sourceMappingURL=readInstalled.js.map


var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unmark(deps, obj, dev, unsetOptional) {
    for (const name of deps) {
        const dep = findDep(obj, name);
        if (dep != null) {
            if (unsetOptional) {
                dep.optional = false;
            }
            if (dep.extraneous) {
                unmarkExtraneous(dep, dev, false);
            }
        }
    }
}
function unmarkExtraneous(obj, dev, isRoot) {
    // Mark all non-required deps as extraneous.
    // start from the root object and mark as non-extraneous all modules
    // that haven't been previously flagged as extraneous then propagate to all their dependencies
    obj.extraneous = false;
    if (obj.dependencyNames != null) {
        unmark(obj.dependencyNames, obj, dev, true);
    }
    if (dev && obj.devDependencies != null && (isRoot || obj.link)) {
        unmark(Object.keys(obj.devDependencies), obj, dev, true);
    }
    if (obj.peerDependencies != null) {
        unmark(Object.keys(obj.peerDependencies), obj, dev, true);
    }
    if (obj.optionalDependencies != null) {
        unmark(Object.keys(obj.optionalDependencies), obj, dev, false);
    }
}
// find the one that will actually be loaded by require() so we can make sure it's valid
function findDep(obj, name) {
    let r = obj;
    let found = null;
    while (r != null && found == null) {
        // if r is a valid choice, then use that.
        // kinda weird if a pkg depends on itself, but after the first iteration of this loop, it indicates a dep cycle.
        const dependency = r.dependencies == null ? null : r.dependencies[name];
        if (typeof dependency === "object") {
            found = dependency;
        }
        if (found == null && r.realName === name) {
            found = r;
        }
        r = r.link ? null : r.parent;
    }
    return found;
}