"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const _ = require("lodash");
const win32 = process.platform === 'win32';
/**
     * Get the npm lookup directories (`node_modules/`)
     * @return {Array} lookup paths
     */
function getNpmPaths() {
    var paths = [];
    // Add NVM prefix directory
    if (process.env.NVM_PATH) {
        paths.push(Path.join(Path.dirname(process.env.NVM_PATH), 'node_modules'));
    }
    // Adding global npm directories
    // We tried using npm to get the global modules path, but it haven't work out
    // because of bugs in the parseable implementation of `ls` command and mostly
    // performance issues. So, we go with our best bet for now.
    if (process.env.NODE_PATH) {
        paths = _.compact(process.env.NODE_PATH.split(Path.delimiter)).concat(paths);
    }
    // global node_modules should be 4 or 2 directory up this one (most of the time)
    paths.push(Path.join(__dirname, '../../../..'));
    paths.push(Path.join(__dirname, '../..'));
    // Default paths for each system
    if (win32) {
        paths.push(Path.join(process.env.APPDATA, 'npm/node_modules'));
    }
    else {
        paths.push('/usr/lib/node_modules');
        paths.push('/usr/local/lib/node_modules');
    }
    paths = paths.concat(require('global-modules'));
    // Walk up the CWD and add `node_modules/` folder lookup on each level
    process.cwd().split(Path.sep).forEach(function (_, i, parts) {
        var lookup = Path.join.apply(Path, parts.slice(0, i + 1).concat(['node_modules']));
        if (!win32) {
            lookup = '/' + lookup;
        }
        paths.push(lookup);
    });
    return paths.reverse();
}
exports.getNpmPaths = getNpmPaths;
;
