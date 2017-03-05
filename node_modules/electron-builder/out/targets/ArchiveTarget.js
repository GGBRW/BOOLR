"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ArchiveTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderCore;

function _load_electronBuilderCore() {
    return _electronBuilderCore = require("electron-builder-core");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _path = _interopRequireWildcard(require("path"));

var _archive;

function _load_archive() {
    return _archive = require("./archive");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ArchiveTarget extends (_electronBuilderCore || _load_electronBuilderCore()).Target {
    constructor(name, outDir, packager) {
        super(name);
        this.outDir = outDir;
        this.packager = packager;
    }
    build(appOutDir, arch) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const packager = _this.packager;
            const isMac = packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC;
            const outDir = _this.outDir;
            const format = _this.name;
            (0, (_log || _load_log()).log)(`Building ${isMac ? "macOS " : ""}${format}`);
            // we use app name here - see https://github.com/electron-userland/electron-builder/pull/204
            const outFile = function () {
                switch (packager.platform) {
                    case (_electronBuilderCore || _load_electronBuilderCore()).Platform.MAC:
                        return _path.join(outDir, packager.generateName2(format, "mac", false));
                    case (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS:
                        return _path.join(outDir, packager.generateName(format, arch, false, "win"));
                    case (_electronBuilderCore || _load_electronBuilderCore()).Platform.LINUX:
                        return _path.join(outDir, packager.generateName(format, arch, true));
                    default:
                        throw new Error(`Unknown platform: ${packager.platform}`);
                }
            }();
            if (format.startsWith("tar.")) {
                yield (0, (_archive || _load_archive()).tar)(packager.config.compression, format, outFile, appOutDir, isMac);
            } else {
                yield (0, (_archive || _load_archive()).archive)(packager.config.compression, format, outFile, appOutDir);
            }
            packager.dispatchArtifactCreated(outFile, _this, isMac ? packager.generateName2(format, "mac", true) : packager.generateName(format, arch, true, packager.platform === (_electronBuilderCore || _load_electronBuilderCore()).Platform.WINDOWS ? "win" : null));
        })();
    }
}
exports.ArchiveTarget = ArchiveTarget; //# sourceMappingURL=ArchiveTarget.js.map