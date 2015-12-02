gulp-sprites ![npm version](https://img.shields.io/npm/v/gulp-spriters.svg) ![build](https://travis-ci.org/progrape/gulp-spriters.svg)
===


##简介

自动拼接css文件中指定需要合并的图片，支持@2x图片。图片处理基于[jimp](https://github.com/oliver-moran/jimp)，无需安装其他复杂的依赖。

##安装

```
npm install --save-dev gulp-spriters
```

##使用

css文件：

```css
/* icon.css */
.icon_button2{
    display: inline-block;
    vertical-align: middle;
    width: 56px;
    height: 56px;
    /* here will be replace sprite image path, and auto set the background-position */
    background: url("./images/button.png?__sprite");
}

.icon_msg2{
    display: inline-block;
    vertical-align: middle;
    width: 56px;
    height: 56px;
    /* here will be replace sprite image path, and auto set the background-position */
    background: url("./images/msg.png?__sprite");
}

.icon_shake2{
    display: inline-block;
    vertical-align: middle;
    width: 45px;
    height: 45px;
    /* here will be replace sprite image path, and auto set the background-position */
    background: url("./images/shake@2x.png?__sprite");
}

.icon_nearby2{
    display: inline-block;
    vertical-align: middle;
    width: 45px;
    height: 45px;
    /* here will be replace sprite image path, and auto set the background-position */
    background: url("./images/nearby@2x.png?__sprite");
}
```

gulpfile.js文件：

```javascript

var spriters = require('gulp-spriters');

gulp.src('src/**/*.css')
    .pipe(spriters())
    .pipe(gulp.dest('dist/style'));

```

拼接后的图片文件名为`icon_z.png`或`icon_z@2x.png`，自动修正`background-position`和`background-size`。


## License

gulp-spriters is licensed under the MIT license.