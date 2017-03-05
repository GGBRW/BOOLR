"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BintrayPublisher = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _bintray;

function _load_bintray() {
    return _bintray = require("electron-builder-http/out/bintray");
}

var _electronBuilderUtil;

function _load_electronBuilderUtil() {
    return _electronBuilderUtil = require("electron-builder-util");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _nodeHttpExecutor;

function _load_nodeHttpExecutor() {
    return _nodeHttpExecutor = require("electron-builder-util/out/nodeHttpExecutor");
}

var _publisher;

function _load_publisher() {
    return _publisher = require("./publisher");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BintrayPublisher extends (_publisher || _load_publisher()).HttpPublisher {
    constructor(context, info, version) {
        let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        super(context);
        this.version = version;
        this.options = options;
        this.providerName = "Bintray";
        let token = info.token;
        if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(token)) {
            token = process.env.BT_TOKEN;
            if ((0, (_electronBuilderUtil || _load_electronBuilderUtil()).isEmptyOrSpaces)(token)) {
                throw new Error(`Bintray token is not set, neither programmatically, nor using env "BT_TOKEN"`);
            }
        }
        this.client = new (_bintray || _load_bintray()).BintrayClient(info, this.context.cancellationToken, token);
        this._versionPromise = this.init();
    }
    init() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            try {
                return yield _this.client.getVersion(_this.version);
            } catch (e) {
                if (e instanceof (_electronBuilderHttp || _load_electronBuilderHttp()).HttpError && e.response.statusCode === 404) {
                    if (_this.options.publish !== "onTagOrDraft") {
                        (0, (_log || _load_log()).log)(`Version ${_this.version} doesn't exist, creating one`);
                        return _this.client.createVersion(_this.version);
                    } else {
                        (0, (_log || _load_log()).log)(`Version ${_this.version} doesn't exist, artifacts will be not published`);
                    }
                }
                throw e;
            }
        })();
    }
    doUpload(fileName, dataLength, requestProcessor) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const version = yield _this2._versionPromise;
            if (version == null) {
                (0, (_electronBuilderUtil || _load_electronBuilderUtil()).debug)(`Version ${_this2.version} doesn't exist and is not created, artifact ${fileName} is not published`);
                return;
            }
            let badGatewayCount = 0;
            for (let i = 0; i < 3; i++) {
                try {
                    return yield (_nodeHttpExecutor || _load_nodeHttpExecutor()).httpExecutor.doApiRequest((0, (_electronBuilderHttp || _load_electronBuilderHttp()).configureRequestOptions)({
                        hostname: "api.bintray.com",
                        path: `/content/${_this2.client.owner}/${_this2.client.repo}/${_this2.client.packageName}/${version.name}/${fileName}`,
                        method: "PUT",
                        headers: {
                            "Content-Length": dataLength,
                            "X-Bintray-Override": "1",
                            "X-Bintray-Publish": "1"
                        }
                    }, _this2.client.auth), _this2.context.cancellationToken, requestProcessor);
                } catch (e) {
                    if (e instanceof (_electronBuilderHttp || _load_electronBuilderHttp()).HttpError && e.response.statusCode === 502 && badGatewayCount++ < 3) {
                        continue;
                    }
                    throw e;
                }
            }
        })();
    }
    //noinspection JSUnusedGlobalSymbols
    deleteRelease() {
        if (!this._versionPromise.isFulfilled()) {
            return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve();
        }
        const version = this._versionPromise.value();
        return version == null ? (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve() : this.client.deleteVersion(version.name);
    }
    toString() {
        return `Bintray (user: ${this.client.user || this.client.owner}, owner: ${this.client.owner},  package: ${this.client.packageName}, repository: ${this.client.repo}, version: ${this.version})`;
    }
}
exports.BintrayPublisher = BintrayPublisher; //# sourceMappingURL=BintrayPublisher.js.map