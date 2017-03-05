var child = require('child_process');
var async = require('async');
var sprintf = require('sprintf-js').sprintf;
var printf = function () { console.log(sprintf.apply(null, arguments)); };
var shuffle = require('knuth-shuffle').knuthShuffle;

function sum(arr) {
    var acc = 0;
    arr.forEach(function (val) { acc += val; });
    return acc;
}

function minimum(arr) {
    var min = arr[0];
    arr.forEach(function (val) { min = Math.min(min, val); });
    return min;
}

function maximum(arr) {
    var max = arr[0];
    arr.forEach(function (val) { max = Math.max(max, val); });
    return max;
}

function Sync(func) { this.func = func; }
function Async(func) { this.func = func; }

var target = process.argv[2] || "";
var times  = process.argv[3] || 10000;
var warmup = process.argv[4] || 100;
var offset = process.argv[5] || 500;

var scenarios = {

    'uuid-v4': function () {
        var crypto = require('crypto');
        var UUID = require('../index');

        var random = crypto.randomBytes;
        var stringify = UUID.stringify;

        function uuidv4() {
            var buffer = random(16);
            buffer[6] = (buffer[6] & 0x0f) | 0x40;
            buffer[8] = (buffer[8] & 0x3f) | 0x80;
            return stringify(buffer);
        }

        return new Sync(uuidv4);
    },

    'node-uuid-v1': function () {
        var uuid = require('node-uuid');
        return new Sync(uuid.v1);
    },

    'node-uuid-v4': function () {
        var uuid = require('node-uuid');
        return new Sync(uuid.v4);
    },

    'sync-v1': function () {
        var UUID = require('../index');
        return new Sync(UUID.v1);
    },

    'sync-v3': function () {
        var UUID = require('../index');
        return new Sync(UUID.v3.bind(null, {
            name: "https://github.com/scravy/node-1345",
            namespace: UUID.namespace.url
        }));
    },

    'sync-v4': function () {
        var UUID = require('../index');
        return new Sync(UUID.v4);
    },

    'sync-v4-fast': function () {
        var UUID = require('../index');
        return new Sync(UUID.v4fast);
    },

    'sync-v5': function () {
        var UUID = require('../index');
        return new Sync(UUID.v5.bind(null, {
            name: "https://github.com/scravy/node-1345",
            namespace: UUID.namespace.url
        }));
    },

    'async-v1': function () {
        var UUID = require('../index');
        return new Async(UUID.v1);
    },

    'async-v3': function () {
        var UUID = require('../index');
        return new Async(UUID.v3.bind(null, {
            name: "https://github.com/scravy/node-1345",
            namespace: UUID.namespace.url
        }));
    },

    'async-v4': function () {
        var UUID = require('../index');
        return new Async(UUID.v4);
    },

    'async-v5': function () {
        var UUID = require('../index');
        return new Async(UUID.v5.bind(null, {
            name: "https://github.com/scravy/node-1345",
            namespace: UUID.namespace.url
        }));
    }
};

var scenario = scenarios[target || ''];

if (typeof scenario === 'function') {
    scenario = scenario();
}

if (scenario instanceof Sync) {

    var func = scenario.func;

    // warm up
    for (var i = 0; i < warmup; i++) {
        func();
    }

    // benchmark
    setTimeout(function () {
        var uuids = [];

        console.time(target);
        for (var i = 0; i < times; i++) {
            uuids.push(func());
        }
        console.timeEnd(target);
    }, offset);

} else if (scenario instanceof Async) {
    
    var func = scenario.func;

    var uuids = [];

    setTimeout(function () {
        console.time(target);
        async.times(times, function (n, done) {
            func(function (err, uuid) {
                uuids.push(uuid);
                done();
            });
        }, function () {
            console.timeEnd(target);
        });
    }, offset);

} else {

    var results = {};
    var benchmarks = [];
    Object.keys(scenarios).forEach(function (scenario) {
        results[scenario] = [];
        benchmarks.push(function (done) {
            var command = sprintf("node %s %s %d %d %d",
                    module.filename, scenario, times, warmup, offset);
            child.exec(command, function (err, stdout, stderr) {
                if (err) {
                    return console.log(err);
                }
                results[scenario].push(parseInt(stdout.trim().split(' ')[1]));
                done();
            });
        });
    });

    async.timesSeries(parseInt(target) || 10, function (n, done) {
        shuffle(benchmarks);
        async.parallel(benchmarks, done);
    }, function () {

        printf("%12s %8s %8s %8s\n", "BENCHMARK", "MEAN", "MIN", "MAX");

        var means = [];
        Object.keys(results).forEach(function (name) {
            var values = results[name];
            var mean = sum(values) / values.length;
            var min = minimum(values);
            var max = maximum(values);
            means.push(mean);
            results[name] = { mean: mean, min: min, max: max };
            printf("%12s %8.2f %8.2f %8.2f", name, mean, min, max);
        });
        console.log("");
        var best = minimum(means);
        Object.keys(results).forEach(function (name) {
            var r = results[name];
            printf("%12s %8.2f %8.2f %8.2f", name,
                r.mean / best, r.min / best, r.max / best);
        });

    });
}
