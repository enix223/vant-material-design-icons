/**
 * build iconfont from sketch
 */
const { src, dest, series } = require('gulp');
const PluginError = require('plugin-error');
const Vinyl = require('vinyl');
const fs = require('fs-extra');
const path = require('path');
const consolidate = require('consolidate');
const _ = require('lodash');
const Stream = require('stream');

const encode = require('./build-encode');

const srcDir = path.join(__dirname, '../src');
const codepoints = path.join(__dirname, '../material-design-icons/iconfont/codepoints');
const template = path.join(__dirname, './template.tpl');
const mdPackage = path.join(__dirname, '../material-design-icons/package.json')

const PLUGIN_NAME  = 'vant-material-design-icons';
const ttfPath = '../material-design-icons/iconfont/MaterialIcons-Regular.ttf'
const fontName = 'md-icon'

function iconfontCss(config) {
  var glyphMap = [],
		stream,
		outputFile,
		engine;

  // read material design latest version
  const pkg = JSON.parse(fs.readFileSync(mdPackage, 'utf-8'))

  // Set default values
	config = _.merge({
    version: pkg['version'],
		path: 'css',
		targetPath: '_icons.css',
		fontPath: './',
		engine: 'lodash',
	}, config);

  // Validate config
	if (!config.fontName) {
		throw new PluginError(PLUGIN_NAME, 'Missing option "fontName"');
	}
	if (!consolidate[config.engine]) {
		throw new PluginError(PLUGIN_NAME, 'Consolidate missing template engine "' + config.engine + '"');
	}
	try {
		engine = require(config.engine);
	} catch(e) {
		throw new PluginError(PLUGIN_NAME, 'Template engine "' + config.engine + '" not present');
  }
  
  // Happy streaming
	stream = Stream.PassThrough({
		objectMode: true
	});

	stream._transform = function(file, _, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		// Create output file
		if (!outputFile) {
			outputFile = new Vinyl({
				base: file.base,
				cwd: file.cwd,
				path: path.join(file.base, config.targetPath),
				contents: file.isBuffer() ? Buffer.alloc(0) : new Stream.PassThrough()
			});
    }
    
    // get name & code point pairs
    const lines = fs.readFileSync(codepoints, 'utf-8').split(/\r?\n/)
    lines.forEach(function(line) {
			if (line === '') {
				return
			}
      const [name, codepoint] = line.split(' ')
      glyphMap.push({
        glyphName: name,
        codePoint: codepoint
      });
    })
		cb();
	};

	stream._flush = function(cb) {
		var content;
		if (glyphMap.length) {
			consolidate[config.engine](config.cssTemplate, {
					glyphs: glyphMap,
          fontName: config.fontName,
          version: config.version
				}, function(err, html) {
					if (err) {
						throw new PluginError(PLUGIN_NAME, 'Error in template: ' + err.message);
					}

					content = Buffer.from(html);

					if (outputFile.isBuffer()) {
						outputFile.contents = content;
					} else {
						outputFile.contents.write(content);
						outputFile.contents.end();
					}

					stream.push(outputFile);

					cb();
			});
		} else {
			cb();
		}
	};

	return stream;
}

// generate index.less
function build() {
  return src(codepoints)
    .pipe(
      iconfontCss({
        fontName: fontName,
        cssTemplate: template,
        targetPath: '../src/index.less'
      })
    )
    .pipe(dest(srcDir));
}

function copyFont() {
  return src('../material-design-icons/iconfont/*.@(ttf|woff|woff2)')
    .pipe(dest(srcDir))
}

// generate encode.less
function font(done) {
  encode(fontName, srcDir, ttfPath);

  done();
}

exports.default = series(build, copyFont, font);
