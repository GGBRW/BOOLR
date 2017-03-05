"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rebuild = exports.installOrRebuild = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let installOrRebuild = exports.installOrRebuild = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (config, appDir, electronVersion, platform, arch) {
        let forceInstall = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

        const args = (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(config.npmArgs);
        if (forceInstall || !(yield (0, (_fs || _load_fs()).exists)(_path.join(appDir, "node_modules")))) {
            yield installDependencies(appDir, electronVersion, platform, arch, args, !config.npmSkipBuildFromSource);
        } else {
            yield rebuild(appDir, electronVersion, platform, arch, args, !config.npmSkipBuildFromSource);
        }
    });

    return function installOrRebuild(_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
    };
})();

let rebuild = exports.rebuild = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (appDir, electronVersion) {
        let platform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.platform;
        let arch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : process.arch;
        let additionalArgs = arguments[4];
        let buildFromSource = arguments[5];

        const pathToDep = yield (0, (_readInstalled || _load_readInstalled()).readInstalled)(appDir);
        const nativeDeps = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.filter(pathToDep.values(), function (it) {
            return it.extraneous ? false : (0, (_fs || _load_fs()).exists)(_path.join(it.path, "binding.gyp"));
        }, { concurrency: 8 });
        if (nativeDeps.length === 0) {
            (0, (_log || _load_log()).log)(`No native production dependencies`);
            return;
        }
        (0, (_log || _load_log()).log)(`Rebuilding native production dependencies for ${platform}:${arch}`);
        let execPath = process.env.npm_execpath || process.env.NPM_CLI_JS;
        const isYarn = isYarnPath(execPath);
        const execArgs = [];
        if (execPath == null) {
            execPath = getPackageToolPath();
        } else {
            execArgs.push(execPath);
            execPath = process.env.npm_node_execpath || process.env.NODE_EXE || "node";
        }
        const env = getGypEnv(electronVersion, platform, arch, buildFromSource);
        if (isYarn) {
            execArgs.push("run", "install", "--");
            execArgs.push.apply(execArgs, _toConsumableArray(additionalArgs));
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.each(nativeDeps, function (dep) {
                (0, (_log || _load_log()).log)(`Rebuilding native dependency ${dep.name}`);
                return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)(execPath, execArgs, { cwd: dep.path, env: env }).catch(function (error) {
                    if (dep.optional) {
                        (0, (_log || _load_log()).warn)(`Cannot build optional native dep ${dep.name}`);
                    } else {
                        throw error;
                    }
                });
            });
        } else {
            execArgs.push("rebuild");
            execArgs.push.apply(execArgs, _toConsumableArray(additionalArgs));
            execArgs.push.apply(execArgs, _toConsumableArray(nativeDeps.map(function (it) {
                return it.name;
            })));
            yield (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)(execPath, execArgs, { cwd: appDir, env: env });
        }
    });

    return function rebuild(_x9, _x10) {
        return _ref2.apply(this, arguments);
    };
})();
//# sourceMappingURL=yarn.js.map


exports.getGypEnv = getGypEnv;

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

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

var _readInstalled;

function _load_readInstalled() {
    return _readInstalled = require("./readInstalled");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function getGypEnv(electronVersion, platform, arch, buildFromSource) {
    const gypHome = _path.join((0, (_os || _load_os()).homedir)(), ".electron-gyp");
    return Object.assign({}, process.env, {
        npm_config_disturl: "https://atom.io/download/electron",
        npm_config_target: electronVersion,
        npm_config_runtime: "electron",
        npm_config_arch: arch,
        npm_config_target_arch: arch,
        npm_config_platform: platform,
        npm_config_build_from_source: buildFromSource,
        HOME: gypHome,
        USERPROFILE: gypHome
    });
}
function installDependencies(appDir, electronVersion) {
    let platform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.platform;
    let arch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : process.arch;
    let additionalArgs = arguments[4];
    let buildFromSource = arguments[5];

    (0, (_log || _load_log()).log)(`Installing app dependencies for arch ${arch} to ${appDir}`);
    let execPath = process.env.npm_execpath || process.env.NPM_CLI_JS;
    const execArgs = ["install", "--production"];
    const isYarn = isYarnPath(execPath);
    if (!isYarn) {
        if (process.env.NPM_NO_BIN_LINKS === "true") {
            execArgs.push("--no-bin-links");
        }
        execArgs.push("--cache-min", "999999999");
    }
    if (execPath == null) {
        execPath = getPackageToolPath();
    } else {
        execArgs.unshift(execPath);
        execPath = process.env.npm_node_execpath || process.env.NODE_EXE || "node";
    }
    execArgs.push.apply(execArgs, _toConsumableArray(additionalArgs));
    return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).spawn)(execPath, execArgs, {
        cwd: appDir,
        env: getGypEnv(electronVersion, platform, arch, buildFromSource)
    });
}
function getPackageToolPath() {
    if (process.env.FORCE_YARN === "true") {
        return process.platform === "win32" ? "yarn.cmd" : "yarn";
    } else {
        return process.platform === "win32" ? "npm.cmd" : "npm";
    }
}
function isYarnPath(execPath) {
    return process.env.FORCE_YARN === "true" || execPath != null && _path.basename(execPath).startsWith("yarn");
}