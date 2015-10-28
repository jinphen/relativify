# relativify
主要是把基于requirejs baseUrl的路径转成相对路径，如下目录结构

### 使用方法

```shell
relativify [目录] [选项]

选项：
    -dir 选定目录下的文件夹
    -file 选择目录下的文件
    -ext 选定待转换的文件扩展名,如:'-ext js,jsx,es6'；默认为js,jsx
```

### 示例

```
--todo
  +--views
    +--view.js
  +--models
    +--model.js
  +--app.js
```

require配置的baseUrl为todo

```js
//app.js
define(function(require) {
    var view = require('views/view');
    var model = require('models/model');
})
```

运行relativify之后，将转为:

```js
define(function(require) {
    var view = require('./views/view');
    var model = require('./models/model');
})
```
