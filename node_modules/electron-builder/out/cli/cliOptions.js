"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createYargs = createYargs;

var _chalk;

function _load_chalk() {
    return _chalk = require("chalk");
}

var _yargs;

function _load_yargs() {
    return _yargs = _interopRequireDefault(require("yargs"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const publishGroup = "Publishing:";
const buildGroup = "Building:";
const deprecated = "Deprecated:";
function createYargs() {
    //noinspection ReservedWordAsName
    return (_yargs || _load_yargs()).default.example("build -mwl", "build for macOS, Windows and Linux").example("build --linux deb tar.xz", "build deb and tar.xz for Linux").example("build --win --ia32", "build for Windows ia32").example("build --em.foo=bar", "set package.json property `foo` to `bar`").example("build --config.nsis.unicode=false", "configure unicode options for NSIS").option("mac", {
        group: buildGroup,
        alias: ["m", "o", "macos"],
        describe: `Build for macOS, accepts target list (see ${(0, (_chalk || _load_chalk()).underline)("https://goo.gl/HAnnq8")}).`,
        type: "array"
    }).option("linux", {
        group: buildGroup,
        alias: "l",
        describe: `Build for Linux, accepts target list (see ${(0, (_chalk || _load_chalk()).underline)("https://goo.gl/O80IL2")})`,
        type: "array"
    }).option("win", {
        group: buildGroup,
        alias: ["w", "windows"],
        describe: `Build for Windows, accepts target list (see ${(0, (_chalk || _load_chalk()).underline)("https://goo.gl/dL4i8i")})`,
        type: "array"
    }).option("x64", {
        group: buildGroup,
        describe: "Build for x64",
        type: "boolean"
    }).option("ia32", {
        group: buildGroup,
        describe: "Build for ia32",
        type: "boolean"
    }).option("armv7l", {
        group: buildGroup,
        describe: "Build for armv7l",
        type: "boolean"
    }).option("dir", {
        group: buildGroup,
        describe: "Build unpacked dir. Useful to test.",
        type: "boolean"
    }).option("publish", {
        group: publishGroup,
        alias: "p",
        describe: `Publish artifacts (to GitHub Releases), see ${(0, (_chalk || _load_chalk()).underline)("https://goo.gl/WMlr4n")}`,
        choices: ["onTag", "onTagOrDraft", "always", "never"]
    }).option("draft", {
        group: publishGroup,
        describe: "Create a draft (unpublished) release",
        type: "boolean",
        default: undefined
    }).option("prerelease", {
        group: publishGroup,
        describe: "Identify the release as a prerelease",
        type: "boolean",
        default: undefined
    }).option("platform", {
        group: deprecated,
        describe: "The target platform (preferred to use --mac, --win or --linux)",
        choices: ["mac", "win", "linux", "darwin", "win32", "all"]
    }).option("arch", {
        group: deprecated,
        describe: "The target arch (preferred to use --x64 or --ia32)",
        choices: ["ia32", "x64", "all"]
    }).option("extraMetadata", {
        alias: ["em"],
        group: buildGroup,
        describe: "Inject properties to package.json (asar only)"
    }).option("prepackaged", {
        alias: ["pd"],
        group: buildGroup,
        describe: "The path to prepackaged app (to pack in a distributable format)"
    }).option("projectDir", {
        alias: ["project"],
        group: buildGroup,
        describe: "The path to project directory. Defaults to current working directory."
    }).option("config", {
        alias: ["c"],
        group: buildGroup,
        describe: "The path to an electron-builder config. Defaults to `electron-builder.yml` (or `json`, or `json5`), see " + (0, (_chalk || _load_chalk()).underline)("https://goo.gl/YFRJOM")
    }).strict().group(["help", "version"], "Other:").help().version().epilog(`See the Wiki (${(0, (_chalk || _load_chalk()).underline)("https://github.com/electron-userland/electron-builder/wiki")}) for more documentation.`);
}
//# sourceMappingURL=cliOptions.js.map