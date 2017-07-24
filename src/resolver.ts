/** This is filed is based on a algorithm found in yeoman somewhere */
import * as Path from 'path';
import * as globby from 'globby';
import * as  _ from 'lodash';
import * as Debug from 'debug';
import * as fs from 'mz/fs';
import { getNpmPaths } from './utils';

const debug = Debug('ceveral:repository:resolver');


export namespace resolver {
    export const lookups = ['.'];

    /**
     * Search for modules
     * 
     * @export
     * @param {string} prefix 
     * @returns 
     */
    export async function lookup(prefix: string) {
        var generatorsModules = await findGeneratorsIn(getNpmPaths(), prefix);
        var patterns: string[] = [];

        let files = lookups.forEach(function (lookup) {
            generatorsModules.forEach(function (modulePath) {
                patterns.push(Path.join(modulePath, lookup));
            });
        });

        /*let out: (string | null)[] = [];
        patterns.forEach((pattern) => {
            globby.sync('package.json', { cwd: pattern }).forEach((filename: string) => {
                out.push(tryRegistering(Path.join(pattern, filename)))
            })
        });*/

        const found: { [key: string]: boolean } = {};
        return _.flatten(await Promise.all(patterns.map(pattern => {
            return globby('package.json', { cwd: pattern })
                .then(m => m.map(m => tryRegistering(Path.join(pattern, m))))
        }))).filter(m => m != null)
            .map(m => {
                return {
                    path: m,
                    pkgjson: require(m!)
                }
            }).filter(m => {
                if (found[m.pkgjson.name]) {
                    debug('already found %s', m.pkgjson.name);
                    return false;
                }
                return found[m.pkgjson.name] = true;
            });
    }

    /**
     * Search npm for every available generators.
     * Generators are npm packages who's name start with `generator-` and who're placed in the
     * top level `node_module` path. They can be installed globally or locally.
     *
     * @param {Array}  List of search paths
     * @return {Array} List of the generator modules path
     */
    async function findGeneratorsIn(searchPaths: string[], prefix: string): Promise<string[]> {
        var modules = [];

        for (let root of searchPaths) {
            let match = await globby([
                `${prefix}-*`,
                `@*/${prefix}-*`
            ], { cwd: root });
            modules.push(...match.map(m => Path.join(root, m)))
        }

        return modules;
    };
    /**
     * Try registering a Generator to this environment.
     * @private
     * @param  {String} generatorReference A generator reference, usually a file path.
     */
    function tryRegistering(generatorReference: string) {
        var namespace;
        var realPath = fs.realpathSync(generatorReference);

        try {
            debug('found %s, trying to register', generatorReference);
            return realPath;
        } catch (e) {
            console.error('Unable to register %s (Error: %s)', generatorReference, e.message);
        }

        return null;
    };



}