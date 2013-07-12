# 规则及配置

## 配置
> 这里的配置都以线上规则为例

### js_framework

`String`

框架初始化，出现在页面底部第一段的 JS，对应于 `placeholder: bottom_framework`


```html
<script 
src="http://i1.dpfile.com/mod/neuronjs/2.0.1/neuron.min.js" 
id="neuron-js" 
data-path="mod" 
data-server="http://i{n}.dpfile.com"></script>
```

### publish_dir

`String`

前端模块发布的根目录

	/mod

### is_to_compress

`Boolean`

是否需要引用已压缩的静态文件

	true // product


## 规则

### pathname(package)
如何将一个或多个模块映射到 pathname 

对于模块 `<name>@<version>`

如果 `is_to_compress` 为 `true`

	{publish_dir}/{name}/{version}/{name}.min.js
	
否则

	{publish_dir}/{name}/{version}/{name}.js
	
	
### escaped_pathname

将 `pathname` 中的 `'/'` (slash) 替换为 `'~'` (tile)
	
	
### pathname(combo)

/concat/{escaped_pathname},{escaped_pathname2},...


### package -> url

	{cdn_domain}{pathname}
	
##### example

package: `'ajax@0.1.0'`
url 可能为：

	http://i1.dpfile.com/mod/ajax/0.1.0/ajax.min.js
	
### packages -> url

	{cdn_domain}{escaped_pathname}

##### example

packages: `'ajax@0.1.0'`, `'jsonp@0.1.1'`, `'json@0.2.7'`

	http://i2.dpfile.com/concat/~mod~ajax~0.1.0~ajax.min.js,~mod~jsonp~0.1.1~jsonp.min.js,~mod~json~0.2.7~json.min.js



