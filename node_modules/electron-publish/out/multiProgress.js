"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MultiProgress = undefined;

var _log;

function _load_log() {
    return _log = require("electron-builder-util/out/log");
}

var _progressEx;

function _load_progressEx() {
    return _progressEx = _interopRequireDefault(require("progress-ex"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MultiProgress {
    constructor() {
        this.stream = process.stdout;
        this.cursor = 0;
        this.totalLines = 0;
        this.isLogListenerAdded = false;
        this.barCount = 0;
    }
    createBar(format, options) {
        options.stream = this.stream;
        const bar = new (_progressEx || _load_progressEx()).default(format, options);
        this.barCount++;
        let index = -1;
        const render = bar.render;
        bar.render = tokens => {
            if (index === -1) {
                index = this.totalLines;
                this.allocateLines(1);
            } else {
                this.moveCursor(index);
            }
            render.call(bar, tokens);
            if (!this.isLogListenerAdded) {
                this.isLogListenerAdded = true;
                (0, (_log || _load_log()).setPrinter)(message => {
                    let newLineCount = 0;
                    let newLineIndex = message.indexOf("\n");
                    while (newLineIndex > -1) {
                        newLineCount++;
                        newLineIndex = message.indexOf("\n", ++newLineIndex);
                    }
                    this.allocateLines(newLineCount + 1);
                    this.stream.write(message);
                });
            }
        };
        bar.terminate = () => {
            this.barCount--;
            if (this.barCount === 0 && this.totalLines > 0) {
                this.allocateLines(1);
                this.totalLines = 0;
                this.cursor = 0;
                (0, (_log || _load_log()).setPrinter)(null);
                this.isLogListenerAdded = false;
            }
        };
        bar.tick = (len, tokens) => {
            if (len !== 0) {
                len = len || 1;
            }
            if (tokens != null) {
                bar.tokens = tokens;
            }
            // start time for eta
            if (bar.curr == 0) {
                bar.start = new Date();
            }
            bar.curr += len;
            if (bar.complete) {
                return;
            }
            bar.render();
            // progress complete
            if (bar.curr >= bar.total) {
                bar.complete = true;
                bar.terminate();
                bar.callback(this);
            }
        };
        return bar;
    }
    allocateLines(count) {
        this.stream.moveCursor(0, this.totalLines - 1);
        // if cursor pointed to previous line where \n is already printed, another \n is ignored, so, we can simply print it
        this.stream.write("\n");
        this.totalLines += count;
        this.cursor = this.totalLines - 1;
    }
    moveCursor(index) {
        this.stream.moveCursor(0, index - this.cursor);
        this.cursor = index;
    }
    terminate() {
        this.moveCursor(this.totalLines);
        this.stream.clearLine();
        this.stream.cursorTo(0);
    }
}
exports.MultiProgress = MultiProgress; //# sourceMappingURL=multiProgress.js.map