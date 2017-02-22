# gulp-ccr-browserify

Bundle JavaScript things with Browserify. A cascading configurable gulp recipe for [gulp-chef](https://github.com/gulp-cookery/gulp-chef).

## Install

``` bash
$ npm install --save-dev "gulpjs/gulp#4.0" gulp-chef gulp-ccr-browserify
```

## Recipe

browserify

## Ingredients

* [browser-sync](https://github.com/BrowserSync/browser-sync)

* [node-browserify](https://github.com/substack/node-browserify)

* [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps)

* [gulp-uglify](https://github.com/terinjokes/gulp-uglify)

* [vinyl-source-stream](https://github.com/hughsk/vinyl-source-stream)

* [vinyl-buffer](https://github.com/hughsk/vinyl-buffer)

* [watchify](https://github.com/substack/watchify)

## API

### config.options

Options for all bundles.

See browserify [documentation](https://github.com/substack/node-browserify#browserifyfiles--opts) for all options.

#### config.options.basedir

The directory that browserify starts bundling from for filenames that start with.

#### config.options.builtins

Sets the list of built-ins to use, which by default is set in lib/builtins.js in this distribution.

Type: array of string.

#### config.options.bundleExternal

Boolean option to set if external modules should be bundled. Defaults to true.

Type: boolean

Default: true

#### config.options.commondir

Sets the algorithm used to parse out the common paths. Use false to turn this off, otherwise it uses the commondir module.

Type: string or boolean

#### config.options.detectGlobals

Scan all files for process, global, __filename, and __dirname, defining as necessary. With this option npm modules are more likely to work but bundling takes longer. Default true.

Type: boolean

Default: true

#### config.options.exclude(s)

Prevent the module name or file at file from showing up in the output bundle.

Alias: excludes

Type: array of string

#### config.options.extensions

An array of optional extra extensions for the module lookup machinery to use when the extension has not been specified. By default browserify considers only .js and .json files in such cases.

Alias: extension

Type: array of string

#### config.options.external(s)

Prevent the module or bundle from being loaded into the current bundle, instead referencing from another bundle.

Alias: externals
Type: array of string, or array of the object with properties:

``` javascript
{
    basedir: {
        type: 'path'
    },
    file: {
        type: 'string'
    }
}
```

#### config.options.externalRequireName

Defaults to `require` in expose mode but you can use another name.

Type: string

Default: 'require'

#### config.options.fullpaths

Disables converting module ids into numerical indexes. This is useful for preserving the original paths that a bundle was generated with.

#### config.options.ignore(s)

Prevent the module name or file at file from showing up in the output bundle.

Alias: ignores

Type: array of string

#### config.options.insertGlobals

Insert `process`, `global`, `__filename`, and `__dirname` without analyzing the AST for faster builds but larger output bundles. Default false.

Type: boolean

Default: false

#### config.options.insertGlobalVars

Override the default inserted variables, or set `insertGlobalVars[name]` to `undefined` to not insert a variable which would otherwise be inserted.

#### config.options.noParse

An array which will skip all `requires` and global parsing for each file in the array. Use this for giant libs like jQuery or threejs that don't have any requires or node-style globals but take forever to parse.

Alias: noparse

#### config.options.paths

An array of directories that browserify searches when looking for modules which are not referenced using relative path. Can be absolute or relative to basedir.

Alias: path

Type: array of string

#### config.options.plugin(s)

Register plugins.

Alias: plugins

Type: array of string

#### config.options.require(s)

Make module available from outside the bundle. The module name is anything that can be resolved by require.resolve(). Use an object with `file` and `expose` property to specify a custom dependency name. `{ file: './vendor/angular/angular.js', options: { expose: 'angular' } }` enables `require('angular')`.

Alias: requires

Type: array of string, or object with the following properties:

``` javascript
{
    file: {
        type: 'string'
    },
    options: {
        basedir: {
            description: 'The directory that starts searching from for filenames that start with.',
            type: 'path'
        },
        entry: {
            description: 'Make the module an entry.',
            type: 'boolean',
            default: false
        },
        expose: {
            description: 'Specify a custom dependency name for the module.',
            type: 'string'
        },
        external: {
            note: 'Distingish this option with browserify.external().',
            description: 'Prevent the module from being loaded into the current bundle, instead referencing from another bundle.',
            type: 'boolean',
            default: false
        },
        transform: {
            note: 'Distingish this option with browserify.option.transform.',
            description: 'Allow the module to be transformed.',
            type: 'boolean',
            default: true
        }
    }
}
```

#### config.options.sourcemaps

Add a source map inline to the end of the bundle or separate source map to external file. This makes debugging easier because you can see all the original files if you are in a modern enough browser.

Alias: sourcemap

Type: string or boolean

#### config.options.standalone

Create a standalone module with this given name and a umd wrapper. You can use namespaces in the standalone global export using a . in the string name as a separator, for example `A.B.C`. The global export will be sanitized and camel cased.

Type: string

#### config.options.transform(s)

Alias: transforms

Register transforms.

Type: array of string

#### config.options.uglify

Type: boolean or object with the following properties:

``` javascript
{
    mangle: {
        description: 'Pass false to skip mangling names.',
        type: 'boolean',
        default: true
    },
    output: {
        description: 'Pass an object if you wish to specify additional output options. The defaults are optimized for best compression.',
        sequences: {
            description: 'Join consecutive statemets with the "comma operator".',
            type: 'boolean',
            default: true
        },
        properties: {
            description: 'Optimize property access: a["foo"] → a.foo.',
            type: 'boolean',
            default: true
        },
        dead_code: {
            description: 'Discard unreachable code.',
            type: 'boolean',
            default: true
        },
        drop_debugger: {
            description: 'Discard "debugger" statements.',
            type: 'boolean',
            default: true
        },
        unsafe: {
            description: 'Some unsafe optimizations (see below).',
            type: 'boolean',
            default: false
        },
        conditionals: {
            description: 'Optimize if-s and conditional expressions.',
            type: 'boolean',
            default: true
        },
        comparisons: {
            description: 'Optimize comparisons.',
            type: 'boolean',
            default: true
        },
        evaluate: {
            description: 'Evaluate constant expressions.',
            type: 'boolean',
            default: true
        },
        booleans: {
            description: 'Optimize boolean expressions.',
            type: 'boolean',
            default: true
        },
        loops: {
            description: 'Optimize loops.',
            type: 'boolean',
            default: true
        },
        unused: {
            description: 'Drop unused variables/functions.',
            type: 'boolean',
            default: true
        },
        hoist_funs: {
            description: 'Hoist function declarations.',
            type: 'boolean',
            default: true
        },
        hoist_vars: {
            description: 'Hoist variable declarations.',
            type: 'boolean',
            default: false
        },
        if_return: {
            description: 'Optimize if-s followed by return/continue.',
            type: 'boolean',
            default: true
        },
        join_vars: {
            description: 'Join var declarations.',
            type: 'boolean',
            default: true
        },
        cascade: {
            description: 'Try to cascade `right` into `left` in sequences.',
            type: 'boolean',
            default: true
        },
        side_effects: {
            description: 'Drop side-effect-free statements.',
            type: 'boolean',
            default: true
        },
        warnings: {
            description: 'Warn about potentially dangerous optimizations/code.',
            type: 'boolean',
            default: true
        },
        global_defs: {
            description: 'Global definitions.',
            type: 'array',
            items: {
                type: 'object'
            }
        }
    },
    preserveComments: {
        description: 'A convenience option for options.output.comments. Defaults to preserving no comments.',
        enum: ['all', 'license']
    }
}
```

### config.watch

Update any source file and your browserify bundle will be recompiled on the spot.
Options are passed to watchify.

### config.bundles

Bundle or array of bundles.

Alias: bundle

#### bundle.entries

String, or array of strings. Specifying entry file(s).

#### bundle.file

The name of file to write to disk.

#### bundle.options

Options for this bundle. Accepts any values in config.options.

## Usage

``` javascript
var gulp = require('gulp');
var chef = require('gulp-chef');

var meals = chef({
    src: 'src/',
    dest: 'dist/',
    browserify: {
        bundles: [{
            entries: [
                'services.ts'
            ],
            uglify: true
        }, {
            entries: [
                'main.ts'
            ],
            sourcemaps: '.'
        }],
        options: {
            transforms: ['tsify']
        }
    }
});

gulp.registry(meals);
```

## References

* [browserify-handbook](https://github.com/substack/browserify-handbook)

* [partitioning](https://github.com/substack/browserify-handbook#partitioning)

* [Fast browserify builds with watchify](https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md)

* [browserify-handbook - configuring transforms](https://github.com/substack/browserify-handbook#configuring-transforms)

* [Browserify + Globs](https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-with-globs.md)

* [Gulp + Browserify: The Everything Post](http://viget.com/extend/gulp-browserify-starter-faq)

* [gulp-starter/gulp/tasks/browserify.js](https://github.com/greypants/gulp-starter/blob/master/gulp/tasks/browserify.js)

* [Speedy Browserifying with Multiple Bundles](https://lincolnloop.com/blog/speedy-browserifying-multiple-bundles/)

* [gulp + browserify, the gulp-y way](https://medium.com/@sogko/gulp-browserify-the-gulp-y-way-bb359b3f9623)

* [node-browserify/index.js](https://github.com/substack/node-browserify/blob/master/index.js)

* [pull: Make sure entry paths are always full paths #1248](https://github.com/substack/node-browserify/pull/1248)

* [issues: 8.1.1 fails to resolve modules from "browser" field #1072](https://github.com/substack/node-browserify/issues/1072#issuecomment-70323972)

* [issues: browser field in package.json no longer works #1250](https://github.com/substack/node-browserify/issues/1250)

* [issues: browser field in package.json no longer works #1250 comment](https://github.com/substack/node-browserify/issues/1250#issuecomment-99970224)

## License
[MIT](https://opensource.org/licenses/MIT)

## Author
[Amobiz](https://github.com/amobiz)
