#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var glob = require('glob');
var co = require('co');
var thunkify = require('thunkify');
var program = require('commander');
var version = require('./package').version;

var readFile = thunkify(fs.readFile);
var writeFile = thunkify(fs.writeFile);
var globify = thunkify(glob);

var root = process.cwd();
var isReltive = /^((\.\.?(\\|\/))|(\\|\/))/;
var extname = ['', '.js', '.jsx', '.html'];

program
  .version(version)
  .usage('<path> [<path>] [options]')
  .option('-d, --dir [dir]', 'Set special dir to resolve, default equal to base')
  .option('-f, --file [file]', 'Set resolve file, if this set, --ext will not word')
  .option('-e, --ext [exit]', 'Set file extention, eg: js,jsx, default js,jsx')
  .parse(process.argv);

if (program.args.length) {
    var src = program.args[0];
    root = path.isAbsolute(src) ? src : path.join(root, src);
}

var patten = '*.+';
if (program.file) {
    patten = program.file;
} else if (program.ext) {
    patten += '(' + program.ext.split(',').join('|') + ')';
} else {
    patten += '(js|jsx)';
}

execute(root, program.dir);

function execute(base, project) {
    co(function* () {
        var search = path.join(base, project || '', '**/' + patten);
        // console.log(search);
        var files = yield globify(search);
        var resolvedFiles = 0;

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            var content = yield readFile(file, {encoding: 'utf8'});
            var newContent = replaceRequire(content, base, file);

            var isResolved = (content != newContent);
            if (isResolved) {
                yield writeFile(file, newContent);
                resolvedFiles++;
                console.log('resolved ==> ', file);
            }
        }
        console.log('resolved %s files', resolvedFiles);
    }).catch(function(err) {
        console.error(err.stack);
    })
}

function replaceRequire(string, base, file) {
    return string.replace(/require\(["|'](.*!)?(.*)["|']\)/g, function(match, p1, p2) {
                if (!isReltive.test(p2)) {
                    p2 = resolvePath(base, path.dirname(file), path.dirname(file), p2) + p2;
                }
                return 'require(\'' + (p1||'') + p2 + '\')';
            });
}

function resolvePath(base, start, current, require) {
    var rel = path.relative(base, current);

    if (!isReltive.test(rel)) {
        var exist = extname.some(function(ext) {
            var file = path.join(current, require) + ext;
            return isFileExists(file);
        });
        if (exist) {
            return (path.relative(start, current) || '.') + path.sep;
        } else {
            return resolvePath(base, start, path.dirname(current), require);
        }
    } else {
        return '';
    }
}

function isFileExists(file) {
    try {
        var stat = fs.statSync(file);
        return stat.isFile();
    } catch(e) {
        return false;
    }
}
