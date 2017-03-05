"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let getGitUrlFromGitConfig = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (projectDir) {
        let data = null;
        try {
            data = yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_path.join(projectDir, ".git", "config"), "utf8");
        } catch (e) {
            if (e.code === "ENOENT" || e.code === "ENOTDIR") {
                return null;
            }
            throw e;
        }
        const conf = data.split(/\r?\n/);
        const i = conf.indexOf('[remote "origin"]');
        if (i !== -1) {
            let u = conf[i + 1];
            if (!u.match(/^\s*url =/)) {
                u = conf[i + 2];
            }
            if (u.match(/^\s*url =/)) {
                return u.replace(/^\s*url = /, "");
            }
        }
        return null;
    });

    return function getGitUrlFromGitConfig(_x) {
        return _ref.apply(this, arguments);
    };
})();

let _getInfo = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (projectDir, repo) {
        if (repo != null) {
            return (0, (_hostedGitInfo || _load_hostedGitInfo()).fromUrl)(typeof repo === "string" ? repo : repo.url);
        }
        let url = process.env.TRAVIS_REPO_SLUG;
        if (url == null) {
            const user = process.env.APPVEYOR_ACCOUNT_NAME || process.env.CIRCLE_PROJECT_USERNAME;
            const project = process.env.APPVEYOR_PROJECT_NAME || process.env.CIRCLE_PROJECT_REPONAME;
            if (user != null && project != null) {
                return {
                    user: user,
                    project: project
                };
            }
            url = yield getGitUrlFromGitConfig(projectDir);
        }
        return url == null ? null : (0, (_hostedGitInfo || _load_hostedGitInfo()).fromUrl)(url);
    });

    return function _getInfo(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();
//# sourceMappingURL=repositoryInfo.js.map


exports.getRepositoryInfo = getRepositoryInfo;

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _hostedGitInfo;

function _load_hostedGitInfo() {
    return _hostedGitInfo = require("hosted-git-info");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getRepositoryInfo(projectDir, metadata, devMetadata) {
    return _getInfo(projectDir, (devMetadata == null ? null : devMetadata.repository) || (metadata == null ? null : metadata.repository));
}