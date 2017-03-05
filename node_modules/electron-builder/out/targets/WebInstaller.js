"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _PublishManager;

function _load_PublishManager() {
    return _PublishManager = require("../publish/PublishManager");
}

var _nsis;

function _load_nsis() {
    return _nsis = _interopRequireDefault(require("./nsis"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WebInstallerTarget extends (_nsis || _load_nsis()).default {
    constructor(packager, outDir, targetName) {
        super(packager, outDir, targetName);
    }
    get isWebInstaller() {
        return true;
    }
    configureDefines(oneClick, defines) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            //noinspection ES6MissingAwait
            yield (_nsis || _load_nsis()).default.prototype.configureDefines.call(_this, oneClick, defines);
            const packager = _this.packager;
            const options = _this.options;
            let appPackageUrl = options.appPackageUrl;
            if (appPackageUrl == null) {
                const publishConfigs = yield (0, (_PublishManager || _load_PublishManager()).getPublishConfigsForUpdateInfo)(packager, (yield (0, (_PublishManager || _load_PublishManager()).getPublishConfigs)(packager, _this.options)));
                if (publishConfigs == null || publishConfigs.length === 0) {
                    throw new Error("Cannot compute app package download URL");
                }
                appPackageUrl = (0, (_PublishManager || _load_PublishManager()).computeDownloadUrl)(publishConfigs[0], null, packager, null);
                defines.APP_PACKAGE_URL_IS_INCOMLETE = null;
            }
            defines.APP_PACKAGE_URL = appPackageUrl;
        })();
    }
    get installerFilenamePattern() {
        return "${productName} Web Setup ${version}.${ext}";
    }
    generateGitHubInstallerName() {
        return `${this.packager.appInfo.name}-WebSetup-${this.packager.appInfo.version}.exe`;
    }
}
exports.default = WebInstallerTarget; //# sourceMappingURL=WebInstaller.js.map