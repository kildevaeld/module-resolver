"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/** This is filed is based on a algorithm found in yeoman somewhere */
const Path = require("path");
const globby = require("globby");
const _ = require("lodash");
const Debug = require("debug");
const fs = require("mz/fs");
const utils_1 = require("./utils");
const debug = Debug('ceveral:repository:resolver');
var resolver;
(function (resolver) {
    resolver.lookups = ['.'];
    /**
     * Search for modules
     *
     * @export
     * @param {string} prefix
     * @returns
     */
    function lookup(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            var generatorsModules = yield findModulesIn(utils_1.getNpmPaths(), prefix);
            var patterns = [];
            let files = resolver.lookups.forEach(function (lookup) {
                generatorsModules.forEach(function (modulePath) {
                    patterns.push(Path.join(modulePath, lookup));
                });
            });
            const found = {};
            return _.flatten(yield Promise.all(patterns.map(pattern => {
                return globby('package.json', { cwd: pattern })
                    .then(m => m.map(m => tryRegistering(Path.join(pattern, m))));
            }))).filter(m => m != null)
                .map(m => {
                return {
                    path: m,
                    pkgjson: require(m)
                };
            }).filter(m => {
                if (found[m.pkgjson.name]) {
                    debug('already found %s', m.pkgjson.name);
                    return false;
                }
                return found[m.pkgjson.name] = true;
            });
        });
    }
    resolver.lookup = lookup;
    /**
     * Search npm for every available module.
     * Generators are npm packages who's name start with `<prfefix>-` and who're placed in the
     * top level `node_module` path. They can be installed globally or locally.
     *
     * @param {Array}  List of search paths
     * @return {Array} List of the generator modules path
     */
    function findModulesIn(searchPaths, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            var modules = [];
            return _.flatten(yield Promise.all(searchPaths.map(root => {
                return globby([
                    `${prefix}-*`,
                    `@*/${prefix}-*`
                ], { cwd: root }).then(m => m.map(m => Path.join(root, m)));
            })));
        });
    }
    ;
    /**
     * Try registering a Generator to this environment.
     * @private
     * @param  {String} generatorReference A generator reference, usually a file path.
     */
    function tryRegistering(generatorReference) {
        var namespace;
        var realPath = fs.realpathSync(generatorReference);
        try {
            debug('found %s, trying to register', generatorReference);
            return realPath;
        }
        catch (e) {
            console.error('Unable to register %s (Error: %s)', generatorReference, e.message);
        }
        return null;
    }
    ;
})(resolver = exports.resolver || (exports.resolver = {}));
