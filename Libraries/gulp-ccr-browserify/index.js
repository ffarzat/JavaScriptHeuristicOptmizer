/* eslint camelcase: 0 */
'use strict';

var schema = {
	title: 'browserify',
	description: 'Bundle JavaScript things with Browserify.',
	definitions: {
		options: {
			properties: {
				basedir: {
					description: 'The directory that browserify starts bundling from for filenames that start with.',
					type: 'path'
				},
				builtins: {
					description: 'Sets the list of built-ins to use, which by default is set in lib/builtins.js in this distribution.',
					type: 'array',
					items: {
						type: 'string'
					}
				},
				bundleExternal: {
					description: 'Boolean option to set if external modules should be bundled. Defaults to true.',
					type: 'boolean',
					default: true
				},
				commondir: {
					description: 'Sets the algorithm used to parse out the common paths. Use false to turn this off, otherwise it uses the commondir module.',
					type: ['string', 'boolean']
				},
				detectGlobals: {
					description: 'Scan all files for process, global, __filename, and __dirname, defining as necessary. With this option npm modules are more likely to work but bundling takes longer. Default true.',
					type: 'boolean',
					default: true
				},
				exclude: {
					note: 'Browserify options do not support `excludes`, we forward this to browserify.exclude().',
					description: 'Prevent the module name or file at file from showing up in the output bundle.',
					alias: ['excludes'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				extensions: {
					description: 'An array of optional extra extensions for the module lookup machinery to use when the extension has not been specified. By default browserify considers only .js and .json files in such cases.',
					alias: ['extension'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				external: {
					note: 'Browserify options do not support `externals`, we forward this to browserify.external().',
					description: 'Prevent the module or bundle from being loaded into the current bundle, instead referencing from another bundle.',
					alias: ['externals'],
					type: 'array',
					items: {
						anyOf: [{
							type: 'string'
						}, {
							type: 'object',
							properties: {
								basedir: {
									type: 'path'
								},
								file: {
									type: 'string'
								}
							}
						}]
					}
				},
				externalRequireName: {
					description: 'Defaults to `require` in expose mode but you can use another name.',
					type: 'string',
					default: 'require'
				},
				fullpaths: {
					description: 'Disables converting module ids into numerical indexes. This is useful for preserving the original paths that a bundle was generated with.'
				},
				ignore: {
					note: 'Browserify options do not support `ignores`, we forward this to browserify.ignore().',
					description: 'Prevent the module name or file at file from showing up in the output bundle.',
					alias: ['ignores'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				insertGlobals: {
					description: 'Insert `process`, `global`, `__filename`, and `__dirname` without analyzing the AST for faster builds but larger output bundles. Default false.',
					type: 'boolean',
					default: false
				},
				insertGlobalVars: {
					description: 'Override the default inserted variables, or set `insertGlobalVars[name]` to `undefined` to not insert a variable which would otherwise be inserted.'
				},
				noParse: {
					description: "An array which will skip all `requires` and global parsing for each file in the array. Use this for giant libs like jQuery or threejs that don't have any requires or node-style globals but take forever to parse.",
					alias: ['noparse']
				},
				paths: {
					description: 'An array of directories that browserify searches when looking for modules which are not referenced using relative path. Can be absolute or relative to basedir.',
					alias: ['path'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				plugin: {
					note: 'Although the options `plugin` is processed properly in constructor of browserify, we still process it explicitly for clarity and make sure plugins are registered before transforms.',
					description: 'Register plugins.',
					alias: ['plugins'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				require: {
					note: 'Although the options `require` is processed properly in constructor of browserify, we still process it explicitly for clarity.',
					description: "Make module available from outside the bundle. The module name is anything that can be resolved by require.resolve(). Use an object with `file` and `expose` property to specify a custom dependency name. `{ file: './vendor/angular/angular.js', options: { expose: 'angular' } }` enables `require('angular')`",
					alias: ['requires'],
					type: 'array',
					items: {
						anyOf: [{
							type: 'string'
						}, {
							type: 'object',
							properties: {
								file: {
									type: 'string'
								},
								options: {
									type: 'object',
									properties: {
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
							}
						}]
					}
				},
				sourcemaps: {
					note: 'Browserify options do not support `sourcemaps`, it uses `debug` for this, we make this clear by name it `sourcemaps` and add option to write external source map file.',
					description: 'Add a source map inline to the end of the bundle or separate source map to external file. This makes debugging easier because you can see all the original files if you are in a modern enough browser.',
					alias: ['sourcemap'],
					anyOf: [{
						type: 'string'
					}, {
						type: 'boolean'
					}],
					default: false
				},
				standalone: {
					description: 'Create a standalone module with this given name and a umd wrapper. You can use namespaces in the standalone global export using a . in the string name as a separator, for example `A.B.C`. The global export will be sanitized and camel cased.',
					type: 'string'
				},
				transform: {
					note: 'Although the options `transform` is processed properly in constructor of browserify, we still process it explicitly for clarity and make sure plugins are registered before transforms.',
					description: 'Register transforms.',
					alias: ['transforms'],
					type: 'array',
					items: {
						type: 'string'
					}
				},
				uglify: {
					description: 'Uglify bundle file.',
					anyOf: [{
						type: 'boolean',
						default: false
					}, {
						type: 'object',
						properties: {
							mangle: {
								description: 'Pass false to skip mangling names.',
								type: 'boolean',
								default: true
							},
							output: {
								description: 'Pass an object if you wish to specify additional output options. The defaults are optimized for best compression.',
								type: 'object',
								properties: {
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
								}
							},
							preserveComments: {
								description: 'A convenience option for options.output.comments. Defaults to preserving no comments.',
								enum: ['all', 'license']
							}
						}
					}]
				}
			}
		}
	},
	properties: {
		bundles: {
			alias: ['bundle'],
			type: 'array',
			items: {
				description: 'Settings for this bundle.',
				type: 'object',
				extends: { $ref: '#/definitions/options' },
				properties: {
					file: {
						description: 'The name of file to write to disk.',
						type: 'string'
					},
					entries: {
						description: 'String, or array of strings. Specifying entry file(s).',
						alias: ['entry'],
						type: 'glob'
					},
					options: {
						description: 'Options for this bundle.',
						type: 'object',
						extends: { $ref: '#/definitions/options' }
					}
				},
				required: ['entries', 'file']
			}
		},
		options: {
			description: 'Common options for all bundles.',
			type: 'object',
			extends: { $ref: '#/definitions/options' }
		},
		watch: {
			description: 'Update any source file and your browserify bundle will be recompiled on the spot.',
			anyOf: [{
				type: 'boolean',
				default: false
			}, {
				type: 'object',
				properties: {
					delay: {
						description: 'The amount of time in milliseconds to wait before emitting an "update" event after a change. Defaults to 100.',
						type: 'integer',
						default: 100
					},
					ignoreWatch: {
						description: 'Ignores monitoring files for changes. If set to true, then **/node_modules/** will be ignored. For other possible values see Chokidar\'s documentation on "ignored".',
						type: ['boolean', 'string']
					},
					poll: {
						description: 'Enables polling to monitor for changes. If set to true, then a polling interval of 100ms is used. If set to a number, then that amount of milliseconds will be the polling interval. For more info see Chokidar\'s documentation on "usePolling" and "interval".',
						type: ['boolean', 'integer']
					}
				}
			}]
		}
	},
	required: ['bundles']
};

/**
 * browserify
 *
 * Bundle JavaScript things with Browserify!
 *
 * Notes
 * -----
 *
 *   Browserify constructor supports the following options:
 *
 *   entries: string|[string]
 *   noparse|noParse: boolean
 *   basedir: string
 *   browserField: boolean
 *   builtins: boolean|[string]
 *   debug: boolean
 *   detectGlobals: boolean
 *   extensions: []
 *   insertGlobals: boolean
 *      commondir: boolean
 *   insertGlobalVars: boolean
 *   bundleExternal: boolean
 *
 *   ignoreTransform: []
 *   transform: [string|{}|[]]
 *      basedir: string
 *      global: boolean
 *   require: []
 *      file: string
 *      entry: boolean
 *      external
 *      transform
 *      basedir: string
 *      expose: boolean
 *   plugin: [string|{}|[]]
 *      basedir: string
 *
 */
function browserifyTask() {
	// lazy loading required modules.
	var Browserify = require('browserify');
	var browserSync = require('browser-sync');
	var buffer = require('vinyl-buffer');
	var log = require('gulp-util').log;
	var merge = require('merge-stream');
	var notify = require('gulp-notify');
	var sourcemaps = require('gulp-sourcemaps');
	var uglify = require('gulp-uglify');
	var vinylify = require('vinyl-source-stream');
	var watchify = require('watchify');
	var _ = require('lodash');

	// NOTE:
	//  1.Transform must be registered after plugin
	//  2.Some plugin (e.g. tsify) use transform internally, so make sure transforms are registered right after browserify initialized.
	var EXCERPTS = ['plugin', 'transform', 'require', 'exclude', 'external', 'ignore'];

	var gulp = this.gulp;
	var config = this.config;

	// Start bundling with Browserify for each bundle config specified
	return merge(_.map(config.bundles, browserifyThis));

	function browserifyThis(bundleConfig) {
		var options, excerpts, browserify;

		options = realizeOptions();
		excerpts = _.pick(options, EXCERPTS);
		options = _.omit(options, EXCERPTS);
		options = prewatch(options);

		browserify = new Browserify(options).on('log', log);

		watch();

		EXCERPTS.forEach(function (name) {
			var excerpt = excerpts[name];

			_apply(excerpt, function (target) {
				browserify[name](target);
			});
		});

		return bundle();

		// Add watchify args
		function prewatch(theOptions) {
			if (config.watch) {
				return _.defaults(theOptions, watchify.args);
			}
			return theOptions;
		}

		function watch() {
			if (config.watch) {
				// Wrap with watchify and rebundle on changes
				browserify = watchify(browserify, typeof config.watch === 'object' && config.watch);
				// Rebundle on update
				browserify.on('update', bundle);
				// bundleLogger.watch(bundleConfig.file);
			}
		}

		function bundle() {
			var stream, dest;
			// Log when bundling starts
			// bundleLogger.start(bundleConfig.file);

			stream = browserify
				.bundle()
				// Report compile errors
				.on('error', handleErrors)
				// Use vinyl-source-stream to make the stream gulp compatible.
				// Specify the desired output filename here.
				.pipe(vinylify(options.file))
				// optional, remove if you don't need to buffer file contents
				.pipe(buffer());

			if (options.sourcemaps) {
				// Loads map from browserify file
				stream = stream.pipe(sourcemaps.init({
					loadMaps: true
				}));
			}

			if (options.uglify) {
				stream = stream.pipe(uglify());
			}

			// Prepares sourcemaps, either internal or external.
			if (options.sourcemaps === true) {
				stream = stream.pipe(sourcemaps.write());
			} else if (typeof options.sourcemaps === 'string') {
				stream = stream.pipe(sourcemaps.write(options.sourcemaps));
			}

			// Specify the output destination
			dest = options.dest || config.dest;
			return stream
				.pipe(gulp.dest(dest.path, dest.options))
				.pipe(browserSync.reload({
					stream: true
				}));
		}

		function realizeOptions() {
			var result;

			result = _.defaults({}, _.omit(bundleConfig, ['options']), bundleConfig.options, config.options);
			result.entries = result.entries.globs;

			// add sourcemap option
			if (result.sourcemaps) {
				// browserify use 'debug' option for sourcemaps,
				// but sometimes we want sourcemaps even in production mode.
				result.debug = true;
			}

			return result;
		}

		function handleErrors() {
			var args = Array.prototype.slice.call(arguments);

			// Send error to notification center with gulp-notify
			notify.onError({
				title: 'Browserify Error',
				message: '<%= error %>'
			}).apply(this, args);

			this.emit('end');
		}
	}

	function _apply(values, fn) {
		if (Array.isArray(values)) {
			values.forEach(fn);
		} else if (values) {
			fn(values);
		}
	}
}

module.exports = browserifyTask;
module.exports.schema = schema;
module.exports.type = 'task';
