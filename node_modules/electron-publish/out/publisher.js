"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpPublisher = exports.Publisher = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

var _ProgressCallbackTransform;

function _load_ProgressCallbackTransform() {
    return _ProgressCallbackTransform = require("electron-builder-http/out/ProgressCallbackTransform");
}

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = require("path");

const progressBarOptions = {
    incomplete: " ",
    width: 20
};
class Publisher {
    constructor(context) {
        this.context = context;
    }
    createProgressBar(fileName, fileStat) {
        if (this.context.progress == null) {
            (0, (_log || _load_log()).log)(`Uploading ${fileName} to ${this.providerName}`);
            return null;
        } else {
            return this.context.progress.createBar(`[:bar] :percent :etas | ${(0, (_chalk || _load_chalk()).green)(fileName)} to ${this.providerName}`, Object.assign({ total: fileStat.size }, progressBarOptions));
        }
    }
    createReadStreamAndProgressBar(file, fileStat, progressBar, reject) {
        const fileInputStream = (0, (_fsExtraP || _load_fsExtraP()).createReadStream)(file);
        fileInputStream.on("error", reject);
        if (progressBar == null) {
            return fileInputStream;
        } else {
            const progressStream = new (_ProgressCallbackTransform || _load_ProgressCallbackTransform()).ProgressCallbackTransform(fileStat.size, this.context.cancellationToken, it => progressBar.tick(it.delta));
            progressStream.on("error", reject);
            return fileInputStream.pipe(progressStream);
        }
    }
}
exports.Publisher = Publisher;
class HttpPublisher extends Publisher {
    constructor(context) {
        let useSafeArtifactName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        super(context);
        this.context = context;
        this.useSafeArtifactName = useSafeArtifactName;
    }
    upload(file, safeArtifactName) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const fileName = (_this.useSafeArtifactName ? safeArtifactName : null) || (0, _path.basename)(file);
            const fileStat = yield (0, (_fsExtraP || _load_fsExtraP()).stat)(file);
            const progressBar = _this.createProgressBar(fileName, fileStat);
            yield _this.doUpload(fileName, fileStat.size, function (request, reject) {
                if (progressBar != null) {
                    // reset (because can be called several times (several attempts)
                    progressBar.update(0);
                }
                return _this.createReadStreamAndProgressBar(file, fileStat, progressBar, reject).pipe(request);
            }, file);
        })();
    }
    uploadData(data, fileName) {
        if (data == null || fileName == null) {
            throw new Error("data or fileName is null");
        }
        return this.doUpload(fileName, data.length, it => it.end(data));
    }
}
exports.HttpPublisher = HttpPublisher; //# sourceMappingURL=publisher.js.map