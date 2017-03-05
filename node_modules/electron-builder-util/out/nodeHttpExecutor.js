"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.httpExecutor = exports.NodeHttpExecutor = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

// only https proxy
let proxyFromNpm = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        let data = "";
        try {
            data = yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_path.join((0, (_os || _load_os()).homedir)(), ".npmrc"), "utf-8");
        } catch (ignored) {
            return null;
        }
        if (!data) {
            return null;
        }
        try {
            const config = (0, (_ini || _load_ini()).parse)(data);
            return config["https-proxy"] || config.proxy;
        } catch (e) {
            // used in nsis auto-updater, do not use .util.warn here
            console.warn(e);
            return null;
        }
    });

    return function proxyFromNpm() {
        return _ref.apply(this, arguments);
    };
})();
// only https url


let createAgent = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        let proxyString = process.env.npm_config_https_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.npm_config_proxy;
        if (!proxyString) {
            proxyString = yield proxyFromNpm();
            if (!proxyString) {
                return null;
            }
        }
        const proxy = (0, (_url || _load_url()).parse)(proxyString);
        const proxyProtocol = proxy.protocol === "https:" ? "Https" : "Http";
        return require("tunnel-agent")[`httpsOver${proxyProtocol}`]({
            proxy: {
                port: proxy.port || (proxyProtocol === "Https" ? 443 : 80),
                host: proxy.hostname,
                proxyAuth: proxy.auth
            }
        });
    });

    return function createAgent() {
        return _ref2.apply(this, arguments);
    };
})();
//# sourceMappingURL=nodeHttpExecutor.js.map


var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _https;

function _load_https() {
    return _https = _interopRequireWildcard(require("https"));
}

var _ini;

function _load_ini() {
    return _ini = require("ini");
}

var _os;

function _load_os() {
    return _os = require("os");
}

var _path = _interopRequireWildcard(require("path"));

var _url;

function _load_url() {
    return _url = require("url");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class NodeHttpExecutor extends (_electronBuilderHttp || _load_electronBuilderHttp()).HttpExecutor {
    download(url, destination, options) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (!options.skipDirCreation) {
                yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_path.dirname(destination));
            }
            if (_this.httpsAgentPromise == null) {
                _this.httpsAgentPromise = createAgent();
            }
            const agent = yield _this.httpsAgentPromise;
            return yield options.cancellationToken.createPromise(function (resolve, reject, onCancel) {
                const parsedUrl = (0, (_url || _load_url()).parse)(url);
                _this.doDownload((0, (_electronBuilderHttp || _load_electronBuilderHttp()).configureRequestOptions)({
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.path,
                    headers: options.headers || undefined,
                    agent: agent
                }), destination, 0, options, function (error) {
                    if (error == null) {
                        resolve(destination);
                    } else {
                        reject(error);
                    }
                }, onCancel);
            });
        })();
    }
    doApiRequest(options, cancellationToken, requestProcessor) {
        let redirectCount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        if (this.debug.enabled) {
            this.debug(`HTTPS request: ${JSON.stringify(options, null, 2)}`);
        }
        return cancellationToken.createPromise((resolve, reject, onCancel) => {
            const request = (_https || _load_https()).request(options, response => {
                try {
                    this.handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor);
                } catch (e) {
                    reject(e);
                }
            });
            this.addTimeOutHandler(request, reject);
            request.on("error", reject);
            requestProcessor(request, reject);
            onCancel(() => request.abort());
        });
    }
    doRequest(options, callback) {
        return (_https || _load_https()).request(options, callback);
    }
}
exports.NodeHttpExecutor = NodeHttpExecutor;
const httpExecutor = exports.httpExecutor = new NodeHttpExecutor();