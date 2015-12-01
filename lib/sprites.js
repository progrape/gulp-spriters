/**
 * Created by jf on 2014/12/30.
 * 1. 从css文件中, 解析需要合并的图片文件
 * 2. 提取到全部需要合并的图片文件, 进行合并
 * 3. 替换css对应的位置
 */

var path = require('path');
var Promise = require('bluebird');
var pack = require('bin-pack');
var File = require('gulp-util').File;
var through = require('through2');
var Jimp = require("jimp");
var _ = require('lodash');
var Error = require('./error');

var regex = /background(?:-image)?:[\s\w]*url\((["']?)([^"';]+)\?__sprite\1\)[^;]*;?/gi;

function getImage(path) {
    return new Promise(function (resolve, reject) {
        Jimp.read(path.absolute).then(function (lenna) {
            resolve({
                match: path.match,
                lenna: lenna,
                width: lenna.bitmap.width,
                height: lenna.bitmap.height
            });
        }).catch(function (err) {
            reject(err);
        });
    });
}

/**
 * 从css内容中解析出需要合并的图片数组
 * @param vinyl
 * @returns {bluebird|exports|module.exports}
 */
function parse(vinyl) {
    return new Promise(function (resolve, reject) {
        // 多维数组, 1x, 2x, ...
        var images = [];
        var contents = vinyl.contents.toString();
        contents.replace(regex, function (match, $1, $2) {
            // $1 是引号, $2才是路径
            var absolute = path.join(path.dirname(vinyl.path), $2);

            var exist = _.findIndex(images, function (img) {
                return img.absolute === absolute;
            });
            // 如果不存在,才添加进去
            if (exist === -1) {
                images.push({
                    match: match,
                    absolute: absolute
                });
            }
        });


        var promises = [];
        for (var i = 0, len = images.length; i < len; i++) {
            promises.push(getImage(images[i]));
        }

        Promise.all(promises).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject(err);
        });
    });
}

function merge(images) {
    return new Promise(function (resolve, reject) {
        var result = pack(images);
        new Jimp(result.width, result.height, function (err, lenna) {
            if (err) {
                return reject(err);
            }

            // draw
            var data = {buffer: null, width: 0, height: 0, items: []};
            _.forEach(result.items, function (bin) {
                lenna.composite(bin.item.lenna, bin.x, bin.y);
                data.items.push({
                    x: bin.x,
                    y: bin.y,
                    match: bin.item.match
                });
            });

            lenna.getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                if (err) {
                    console.log(err.message);
                    return reject(err);
                }
                data.width = lenna.bitmap.width;
                data.height = lenna.bitmap.height;
                data.buffer = buffer;
                resolve(data);
            });
        });
    });
}

function replace(vinyl, data) {
    return new Promise(function (resolve, reject) {
        var content = vinyl.contents.toString();
        var ext = '';
        content = content.replace(regex, function (match, $1, $2) {
            var found = _.find(data.items, function (item) {
                return item.match === match;
            });
            if (found) {
                var x = -found.x;
                var y = -found.y;
                var bs = '';
                if (match.indexOf('@2x') !== -1) {
                    ext = '@2x';
                    x = x / 2;
                    y = y / 2;
                    bs = '-webkit-background-size: ' + data.width / 2 + 'px ' + data.height / 2 + 'px;\nbackground-size: ' + data.width / 2 + 'px ' + data.height / 2 + 'px;';
                }
                return 'background: transparent url("' + getName(vinyl.path, ext) + '") no-repeat ' + x + 'px ' + y + 'px;\n' + bs;
            }
            else {
                return match;
            }
        });
        var file = new File({
            cwd: vinyl.cwd,
            base: vinyl.base,
            path: path.join(path.dirname(vinyl.path), getName(vinyl.path, ext)),
            contents: data.buffer
        });
        vinyl.contents = new Buffer(content);
        resolve(file);
    });
}

function getName(filename, ext) {
    return path.basename(filename, '.css') + '_z' + ext + '.png'
}

module.exports = function (opt) {
    var stream = through.obj(function (vinyl, encoding, cb) {
        if (vinyl.isNull()) {
            return cb(null, vinyl);
        }
        if (vinyl.isStream()) {
            return cb(Error('Streaming is not supported'));
        }

        var self = this;
        parse(vinyl).then(function (images) {
            var bins1 = _.filter(images, function (img) {
                return img.match.indexOf('@2x') === -1;
            });
            var bins2 = _.filter(images, function (img) {
                return img.match.indexOf('@2x') !== -1;
            });
            var promises = [];
            if (bins1.length > 0) {
                promises.push(merge(bins1));
            }
            if (bins2.length > 0) {
                promises.push(merge(bins2));
            }

            return Promise.all(promises);
        }).then(function (data) {
            var promises = [];
            for (var i = 0, len = data.length; i < len; i++) {
                promises.push(replace(vinyl, data[i]));
            }
            return Promise.all(promises);
        }).then(function (files) {
            for (var i = 0, len = files.length; i < len; i++) {
                self.push(files[i]);
            }
            self.push(vinyl);
            return cb();
        });
    });
    return stream;
};