"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PlatformPackager = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let dependencies = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (dir, result) {
        const pathToDep = yield (0, (_readInstalled || _load_readInstalled()).readInstalled)(dir);
        for (const dep of pathToDep.values()) {
            if (dep.extraneous) {
                result.add(dep.path);
            }
        }
    });

    return function dependencies(_x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=platformPackager.js.map


exports.normalizeExt = normalizeExt;

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _deepAssign;

function _load_deepAssign() {
    return _deepAssign = require("electron-builder-util/out/deepAssign");
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

var _path = _interopRequireWildcard(require("path"));

var _asarUtil;

function _load_asarUtil() {
    return _asarUtil = require("./asarUtil");
}

var _fileMatcher;

function _load_fileMatcher() {
    return _fileMatcher = require("./fileMatcher");
}

var _dirPackager;

function _load_dirPackager() {
    return _dirPackager = require("./packager/dirPackager");
}

var _readInstalled;

function _load_readInstalled() {
    return _readInstalled = require("./readInstalled");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PlatformPackager {
    constructor(info) {
        this.info = info;
        this._resourceList = new (_electronBuilderUtil || _load_electronBuilderUtil()).Lazy(() => {
            return (0, (_fsExtraP || _load_fsExtraP()).readdir)(this.buildResourcesDir).catch(e => {
                if (e.code !== "ENOENT") {
                    throw e;
                }
                return [];
            });
        });
        this.config = info.config;
        this.platformSpecificBuildOptions = PlatformPackager.normalizePlatformSpecificBuildOptions(this.config[this.platform.buildConfigurationKey]);
        this.appInfo = this.prepareAppInfo(info.appInfo);
        this.packagerOptions = info.options;
        this.projectDir = info.projectDir;
        this.buildResourcesDir = _path.resolve(this.projectDir, this.relativeBuildResourcesDirname);
    }
    get resourceList() {
        return this._resourceList.value;
    }
    prepareAppInfo(appInfo) {
        return appInfo;
    }
    static normalizePlatformSpecificBuildOptions(options) {
        return options == null ? Object.create(null) : options;
    }
    getCscPassword() {
        const password = this.doGetCscPassword();
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(password)) {
            (0, (_log || _load_log()).log)("CSC_KEY_PASSWORD is not defined, empty password will be used");
            return "";
        } else {
            return password.trim();
        }
    }
    doGetCscPassword() {
        return this.packagerOptions.cscKeyPassword || process.env.CSC_KEY_PASSWORD;
    }
    get relativeBuildResourcesDirname() {
        return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).use)(this.config.directories, it => it.buildResources) || "build";
    }
    computeAppOutDir(outDir, arch) {
        return this.info.prepackaged || _path.join(outDir, `${this.platform.buildConfigurationKey}${(0, (_electronBuilderCore || _load_electronBuilderCore()).getArchSuffix)(arch)}${this.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC ? "" : "-unpacked"}`);
    }
    dispatchArtifactCreated(file, target, safeArtifactName) {
        this.info.dispatchArtifactCreated({
            file: file,
            safeArtifactName: safeArtifactName,
            packager: this,
            target: target
        });
    }
    pack(outDir, arch, targets, postAsyncTasks) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const appOutDir = _this.computeAppOutDir(outDir, arch);
            yield _this.doPack(outDir, appOutDir, _this.platform.nodeName, arch, _this.platformSpecificBuildOptions, targets);
            _this.packageInDistributableFormat(appOutDir, arch, targets, postAsyncTasks);
        })();
    }
    packageInDistributableFormat(appOutDir, arch, targets, postAsyncTasks) {
        postAsyncTasks.push((_bluebirdLst2 || _load_bluebirdLst2()).default.map(targets, it => it.isAsyncSupported ? it.build(appOutDir, arch) : null).then(() => (_bluebirdLst2 || _load_bluebirdLst2()).default.each(targets, it => it.isAsyncSupported ? null : it.build(appOutDir, arch))));
    }
    getExtraFileMatchers(isResources, appOutDir, macroExpander, customBuildOptions) {
        const base = isResources ? this.getResourcesDir(appOutDir) : this.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC ? _path.join(appOutDir, `${this.appInfo.productFilename}.app`, "Contents") : appOutDir;
        return this.getFileMatchers(isResources ? "extraResources" : "extraFiles", this.projectDir, base, true, macroExpander, customBuildOptions);
    }
    createFileMatcher(appDir, resourcesPath, macroExpander, platformSpecificBuildOptions) {
        const patterns = this.info.isPrepackedAppAsar ? null : this.getFileMatchers("files", appDir, _path.join(resourcesPath, "app"), false, macroExpander, platformSpecificBuildOptions);
        const matcher = patterns == null ? new (_fileMatcher || _load_fileMatcher()).FileMatcher(appDir, _path.join(resourcesPath, "app"), macroExpander) : patterns[0];
        if (matcher.isEmpty() || matcher.containsOnlyIgnore()) {
            matcher.addAllPattern();
        } else {
            matcher.addPattern("package.json");
        }
        matcher.addPattern("!**/node_modules/*/{CHANGELOG.md,ChangeLog,changelog.md,README.md,README,readme.md,readme,test,__tests__,tests,powered-test,example,examples,*.d.ts}");
        matcher.addPattern("!**/node_modules/.bin");
        matcher.addPattern("!**/*.{o,hprof,orig,pyc,pyo,rbc,swp}");
        matcher.addPattern("!**/._*");
        matcher.addPattern("!*.iml");
        //noinspection SpellCheckingInspection
        matcher.addPattern("!**/{.git,.hg,.svn,CVS,RCS,SCCS," + "__pycache__,.DS_Store,thumbs.db,.gitignore,.gitattributes," + ".editorconfig,.flowconfig,.jshintrc," + ".yarn-integrity,.yarn-metadata.json,yarn-error.log,yarn.lock,npm-debug.log," + ".idea," + "appveyor.yml,.travis.yml,circle.yml," + ".nyc_output}");
        return matcher;
    }
    doPack(outDir, appOutDir, platformName, arch, platformSpecificBuildOptions, targets) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this2.info.prepackaged != null) {
                return;
            }
            const asarOptions = yield _this2.computeAsarOptions(platformSpecificBuildOptions);
            const macroExpander = function (it) {
                return _this2.expandMacro(it, arch, { "/*": "{,/**/*}" });
            };
            const extraResourceMatchers = _this2.getExtraFileMatchers(true, appOutDir, macroExpander, platformSpecificBuildOptions);
            const extraFileMatchers = _this2.getExtraFileMatchers(false, appOutDir, macroExpander, platformSpecificBuildOptions);
            const resourcesPath = _this2.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC ? _path.join(appOutDir, "Electron.app", "Contents", "Resources") : _path.join(appOutDir, "resources");
            (0, (_log || _load_log()).log)(`Packaging for ${platformName} ${(_electronBuilderCore || _load_electronBuilderCore()).Arch[arch]} using electron ${_this2.info.electronVersion} to ${_path.relative(_this2.projectDir, appOutDir)}`);
            const appDir = _this2.info.appDir;
            const ignoreFiles = new Set([_path.resolve(_this2.info.projectDir, outDir), _path.resolve(_this2.info.projectDir, _this2.buildResourcesDir), _path.resolve(_this2.info.projectDir, "electron-builder.yml"), _path.resolve(_this2.info.projectDir, "electron-builder.json"), _path.resolve(_this2.info.projectDir, "electron-builder.json5")]);
            if (_this2.info.isPrepackedAppAsar) {
                yield (0, (_dirPackager || _load_dirPackager()).unpackElectron)(_this2, appOutDir, platformName, (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch], _this2.info.electronVersion);
            } else {
                // prune dev or not listed dependencies
                yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([dependencies(appDir, ignoreFiles), (0, (_dirPackager || _load_dirPackager()).unpackElectron)(_this2, appOutDir, platformName, (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch], _this2.info.electronVersion)]);
                if ((_electronBuilderUtil || _load_electronBuilderUtil()).debug.enabled) {
                    const nodeModulesDir = _path.join(appDir, "node_modules");
                    (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Dev or extraneous dependencies: ${Array.from(ignoreFiles).slice(2).map(function (it) {
                        return _path.relative(nodeModulesDir, it);
                    }).join(", ")}`);
                }
            }
            let rawFilter = null;
            const excludePatterns = [];
            if (extraResourceMatchers != null) {
                for (const matcher of extraResourceMatchers) {
                    matcher.computeParsedPatterns(excludePatterns, _this2.info.projectDir);
                }
            }
            if (extraFileMatchers != null) {
                for (const matcher of extraFileMatchers) {
                    matcher.computeParsedPatterns(excludePatterns, _this2.info.projectDir);
                }
            }
            const defaultMatcher = _this2.createFileMatcher(appDir, resourcesPath, macroExpander, platformSpecificBuildOptions);
            const filter = defaultMatcher.createFilter(ignoreFiles, rawFilter, excludePatterns.length > 0 ? excludePatterns : null);
            let promise;
            if (_this2.info.isPrepackedAppAsar) {
                promise = (0, (_fs || _load_fs()).copyDir)(appDir, _path.join(resourcesPath), filter);
            } else if (asarOptions == null) {
                promise = (0, (_fs || _load_fs()).copyDir)(appDir, _path.join(resourcesPath, "app"), filter);
            } else {
                const unpackPattern = _this2.getFileMatchers("asarUnpack", appDir, _path.join(resourcesPath, "app"), false, macroExpander, platformSpecificBuildOptions);
                const fileMatcher = unpackPattern == null ? null : unpackPattern[0];
                promise = (0, (_asarUtil || _load_asarUtil()).createAsarArchive)(appDir, resourcesPath, asarOptions, filter, fileMatcher == null ? null : fileMatcher.createFilter());
            }
            //noinspection ES6MissingAwait
            const promises = [promise, (0, (_fs || _load_fs()).unlinkIfExists)(_path.join(resourcesPath, "default_app.asar")), (0, (_fs || _load_fs()).unlinkIfExists)(_path.join(appOutDir, "version")), _this2.postInitApp(appOutDir)];
            if (_this2.platform !== (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC) {
                promises.push((0, (_fsExtraP || _load_fsExtraP()).rename)(_path.join(appOutDir, "LICENSE"), _path.join(appOutDir, "LICENSE.electron.txt")).catch(function () {}));
            }
            if (_this2.info.electronVersion != null && _this2.info.electronVersion[0] === "0") {
                // electron release >= 0.37.4 - the default_app/ folder is a default_app.asar file
                promises.push((0, (_fsExtraP || _load_fsExtraP()).remove)(_path.join(resourcesPath, "default_app")));
            }
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all(promises);
            if (platformName === "darwin" || platformName === "mas") {
                yield require("./packager/mac").createApp(_this2, appOutDir);
            }
            yield (0, (_fileMatcher || _load_fileMatcher()).copyFiles)(extraResourceMatchers);
            yield (0, (_fileMatcher || _load_fileMatcher()).copyFiles)(extraFileMatchers);
            if (_this2.info.cancellationToken.cancelled) {
                return;
            }
            yield _this2.info.afterPack({
                appOutDir: appOutDir,
                packager: _this2,
                electronPlatformName: platformName,
                arch: arch,
                targets: targets
            });
            yield _this2.sanityCheckPackage(appOutDir, asarOptions != null);
        })();
    }
    postInitApp(executableFile) {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {})();
    }
    getIconPath() {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            return null;
        })();
    }
    computeAsarOptions(customBuildOptions) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            function errorMessage(name) {
                return `${name} is deprecated is deprecated and not supported — please use asarUnpack`;
            }
            const buildMetadata = _this3.config;
            if (buildMetadata["asar-unpack"] != null) {
                throw new Error(errorMessage("asar-unpack"));
            }
            if (buildMetadata["asar-unpack-dir"] != null) {
                throw new Error(errorMessage("asar-unpack-dir"));
            }
            const platformSpecific = customBuildOptions.asar;
            const result = platformSpecific == null ? _this3.config.asar : platformSpecific;
            if (result === false) {
                const appAsarStat = yield (0, (_fs || _load_fs()).statOrNull)(_path.join(_this3.info.appDir, "app.asar"));
                //noinspection ES6MissingAwait
                if (appAsarStat == null || !appAsarStat.isFile()) {
                    (0, (_log || _load_log()).warn)("Packaging using asar archive is disabled — it is strongly not recommended.\n" + "Please enable asar and use asarUnpack to unpack files that must be externally available.");
                }
                return null;
            }
            const defaultOptions = {
                extraMetadata: _this3.packagerOptions.extraMetadata
            };
            if (result == null || result === true) {
                return defaultOptions;
            }
            for (const name of ["unpackDir", "unpack"]) {
                if (result[name] != null) {
                    throw new Error(errorMessage(`asar.${name}`));
                }
            }
            return (0, (_deepAssign || _load_deepAssign()).deepAssign)({}, result, defaultOptions);
        })();
    }
    getFileMatchers(name, defaultSrc, defaultDest, allowAdvancedMatching, macroExpander, customBuildOptions) {
        const globalPatterns = this.config[name];
        const platformSpecificPatterns = customBuildOptions[name];
        const defaultMatcher = new (_fileMatcher || _load_fileMatcher()).FileMatcher(defaultSrc, defaultDest, macroExpander);
        const fileMatchers = [];
        function addPatterns(patterns) {
            if (patterns == null) {
                return;
            } else if (!Array.isArray(patterns)) {
                if (typeof patterns === "string") {
                    defaultMatcher.addPattern(patterns);
                    return;
                }
                patterns = [patterns];
            }
            for (const pattern of patterns) {
                if (typeof pattern === "string") {
                    // use normalize to transform ./foo to foo
                    defaultMatcher.addPattern(pattern);
                } else if (allowAdvancedMatching) {
                    const from = pattern.from == null ? defaultSrc : _path.resolve(defaultSrc, pattern.from);
                    const to = pattern.to == null ? defaultDest : _path.resolve(defaultDest, pattern.to);
                    fileMatchers.push(new (_fileMatcher || _load_fileMatcher()).FileMatcher(from, to, macroExpander, pattern.filter));
                } else {
                    throw new Error(`Advanced file copying not supported for "${name}"`);
                }
            }
        }
        addPatterns(globalPatterns);
        addPatterns(platformSpecificPatterns);
        if (!defaultMatcher.isEmpty()) {
            // default matcher should be first in the array
            fileMatchers.unshift(defaultMatcher);
        }
        return fileMatchers.length === 0 ? null : fileMatchers;
    }
    getResourcesDir(appOutDir) {
        return this.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC ? this.getMacOsResourcesDir(appOutDir) : _path.join(appOutDir, "resources");
    }
    getMacOsResourcesDir(appOutDir) {
        return _path.join(appOutDir, `${this.appInfo.productFilename}.app`, "Contents", "Resources");
    }
    checkFileInPackage(resourcesDir, file, messagePrefix, isAsar) {
        var _this4 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const relativeFile = _path.relative(_this4.info.appDir, _path.resolve(_this4.info.appDir, file));
            if (isAsar) {
                yield (0, (_asarUtil || _load_asarUtil()).checkFileInArchive)(_path.join(resourcesDir, "app.asar"), relativeFile, messagePrefix);
                return;
            }
            const pathParsed = _path.parse(file);
            // Even when packaging to asar is disabled, it does not imply that the main file can not be inside an .asar archive.
            // This may occur when the packaging is done manually before processing with electron-builder.
            if (pathParsed.dir.indexOf(".asar") !== -1) {
                // The path needs to be split to the part with an asar archive which acts like a directory and the part with
                // the path to main file itself. (e.g. path/arch.asar/dir/index.js -> path/arch.asar, dir/index.js)
                const pathSplit = pathParsed.dir.split(_path.sep);
                let partWithAsarIndex = 0;
                pathSplit.some(function (pathPart, index) {
                    partWithAsarIndex = index;
                    return pathPart.endsWith(".asar");
                });
                const asarPath = _path.join.apply(_path, pathSplit.slice(0, partWithAsarIndex + 1));
                let mainPath = pathSplit.length > partWithAsarIndex + 1 ? _path.join.apply(pathSplit.slice(partWithAsarIndex + 1)) : "";
                mainPath += _path.join(mainPath, pathParsed.base);
                yield (0, (_asarUtil || _load_asarUtil()).checkFileInArchive)(_path.join(resourcesDir, "app", asarPath), mainPath, messagePrefix);
            } else {
                const outStat = yield (0, (_fs || _load_fs()).statOrNull)(_path.join(resourcesDir, "app", relativeFile));
                if (outStat == null) {
                    throw new Error(`${messagePrefix} "${relativeFile}" does not exist. Seems like a wrong configuration.`);
                } else {
                    //noinspection ES6MissingAwait
                    if (!outStat.isFile()) {
                        throw new Error(`${messagePrefix} "${relativeFile}" is not a file. Seems like a wrong configuration.`);
                    }
                }
            }
        })();
    }
    sanityCheckPackage(appOutDir, isAsar) {
        var _this5 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const outStat = yield (0, (_fs || _load_fs()).statOrNull)(appOutDir);
            if (outStat == null) {
                throw new Error(`Output directory "${appOutDir}" does not exist. Seems like a wrong configuration.`);
            } else {
                //noinspection ES6MissingAwait
                if (!outStat.isDirectory()) {
                    throw new Error(`Output directory "${appOutDir}" is not a directory. Seems like a wrong configuration.`);
                }
            }
            const resourcesDir = _this5.getResourcesDir(appOutDir);
            yield _this5.checkFileInPackage(resourcesDir, _this5.appInfo.metadata.main || "index.js", "Application entry file", isAsar);
            yield _this5.checkFileInPackage(resourcesDir, "package.json", "Application", isAsar);
        })();
    }
    expandArtifactNamePattern(targetSpecificOptions, ext, arch, defaultPattern) {
        let pattern = targetSpecificOptions == null ? null : targetSpecificOptions.artifactName;
        if (pattern == null) {
            pattern = this.platformSpecificBuildOptions.artifactName || this.config.artifactName || defaultPattern || "${productName}-${version}.${ext}";
        }
        return this.expandMacro(pattern, arch, {
            ext: ext
        });
    }
    expandMacro(pattern, arch) {
        let extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (arch == null) {
            pattern = pattern.replace("-${arch}", "").replace(" ${arch}", "").replace("_${arch}", "").replace("/${arch}", "");
        }
        const appInfo = this.appInfo;
        return pattern.replace(/\$\{([_a-zA-Z./*]+)\}/g, (match, p1) => {
            switch (p1) {
                case "name":
                    return appInfo.name;
                case "version":
                    return appInfo.version;
                case "productName":
                    return appInfo.productFilename;
                case "arch":
                    if (arch == null) {
                        // see above, we remove macro if no arch
                        return "";
                    }
                    return (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch];
                case "os":
                    return this.platform.buildConfigurationKey;
                default:
                    if (p1.startsWith("env.")) {
                        const envName = p1.substring("env.".length);
                        const envValue = process.env[envName];
                        if (envValue == null) {
                            throw new Error(`Env ${envName} is not defined`);
                        }
                        return envValue;
                    }
                    const value = extra[p1];
                    if (value == null) {
                        throw new Error(`Macro ${p1} is not defined`);
                    } else {
                        return value;
                    }
            }
        });
    }
    generateName(ext, arch, deployment) {
        let classifier = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        let c = null;
        let e = null;
        if (arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.x64) {
            if (ext === "AppImage") {
                c = "x86_64";
            } else if (ext === "deb") {
                c = "amd64";
            }
        } else if (arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32 && ext === "deb") {
            c = "i386";
        } else if (ext === "pacman") {
            if (arch === (_electronBuilderCore || _load_electronBuilderCore()).Arch.ia32) {
                c = "i686";
            }
            e = "pkg.tar.xz";
        } else {
            c = (_electronBuilderCore || _load_electronBuilderCore()).Arch[arch];
        }
        if (c == null) {
            c = classifier;
        } else if (classifier != null) {
            c += `-${classifier}`;
        }
        if (e == null) {
            e = ext;
        }
        return this.generateName2(e, c, deployment);
    }
    generateName2(ext, classifier, deployment) {
        const dotExt = ext == null ? "" : `.${ext}`;
        const separator = ext === "deb" ? "_" : "-";
        return `${deployment ? this.appInfo.name : this.appInfo.productFilename}${separator}${this.appInfo.version}${classifier == null ? "" : `${separator}${classifier}`}${dotExt}`;
    }
    getDefaultIcon(ext) {
        var _this6 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const resourceList = yield _this6.resourceList;
            const name = `icon.${ext}`;
            if (resourceList.indexOf(name) !== -1) {
                return _path.join(_this6.buildResourcesDir, name);
            } else {
                (0, (_log || _load_log()).warn)("Application icon is not set, default Electron icon will be used");
                return null;
            }
        })();
    }
    getTempFile(suffix) {
        return this.info.tempDirManager.getTempFile(suffix);
    }
    get fileAssociations() {
        return (0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(this.config.fileAssociations).concat((0, (_electronBuilderUtil || _load_electronBuilderUtil()).asArray)(this.platformSpecificBuildOptions.fileAssociations));
    }
    getResource(custom) {
        var _this7 = this;

        for (var _len = arguments.length, names = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            names[_key - 1] = arguments[_key];
        }

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (custom === undefined) {
                const resourceList = yield _this7.resourceList;
                for (const name of names) {
                    if (resourceList.indexOf(name) !== -1) {
                        return _path.join(_this7.buildResourcesDir, name);
                    }
                }
            } else if (custom != null && !(0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(custom)) {
                const resourceList = yield _this7.resourceList;
                if (resourceList.indexOf(custom) !== -1) {
                    return _path.join(_this7.buildResourcesDir, custom);
                }
                let p = _path.resolve(_this7.buildResourcesDir, custom);
                if ((yield (0, (_fs || _load_fs()).statOrNull)(p)) == null) {
                    p = _path.resolve(_this7.projectDir, custom);
                    if ((yield (0, (_fs || _load_fs()).statOrNull)(p)) == null) {
                        throw new Error(`Cannot find specified resource "${custom}", nor relative to "${_this7.buildResourcesDir}", neither relative to project dir ("${_this7.projectDir}")`);
                    }
                }
                return p;
            }
            return null;
        })();
    }
    get forceCodeSigning() {
        const forceCodeSigningPlatform = this.platformSpecificBuildOptions.forceCodeSigning;
        return (forceCodeSigningPlatform == null ? this.config.forceCodeSigning : forceCodeSigningPlatform) || false;
    }
}
exports.PlatformPackager = PlatformPackager; // remove leading dot

function normalizeExt(ext) {
    return ext.startsWith(".") ? ext.substring(1) : ext;
}