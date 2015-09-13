# relativify
主要是把基于requirejs baseUrl的路径转成相对路径，如下目录结构

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
