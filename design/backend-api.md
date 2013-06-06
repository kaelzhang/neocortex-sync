# 服务器端，门面入口

### 描述
它是一个在后端页面代码中使用的方法，用于声明一个前端 [门面](http://en.wikipedia.org/wiki/Facade_pattern) 的初始化。

这部分代码，并不是 'neocortex' 项目的设计，而是业务的 web framework 需要实现的方法。

### 作用

- 作为前后端接口声明的唯一入口，意在统一前后端接口的格式
- 用于注册页面 **直接依赖** 的前端模块


## API 设计说明

以 freemarker 的 tag 为例，

	<@facade mod="${module_identifier}" data="${init_data}" />
	
这一段代码需要在源代码的合适位置输出以下内容：（具体情况会在下个章节说明）
	
	facade({
		mod  : ${module_identifier},
		data : ${init_data}
	});

### 参数

#### module_identifier

type: `String`

门面模块的名字和版本，以 "@" 隔开。有以下情况：

##### 'abc@0.1.0'

模块名为：`'abc'` 版本为 `'0.1.0'`

##### 'abc@latest'

最新版本的 `'abc'` 模块

##### 'abc'

若模块的版本没有定义，那么指代最新版本。即 `'abc'` 与 `'abc@latest'` 等价。

#### init_data

type: `String` 

类型为 `String` 只是因为它是 freemarker 页面上的内容，由于 `initData` 会拼装为 inline 的 JavaScript 代码，因此该变量必须为标准的 JavaScript 对象的代码字符串，必须符合 JavaScript 的语法。


## 后端逻辑

### 基础配置

#### cdn_domains
type: `Array.<url>`

用于做 cdn 散列的候选域名组

#### url_pattern
type: `String`

用于生成模块 idenfitier 生成资源的 url，比如
`'{domains}/mod/{module}/{version}/index.js'`

#### combo_url_pattern
type: `String`

用于将多个模块生成成 combo 文件的 pattern

#### f2e_framework_code
type: `String`

前端框架的初始化代码，包括基础的 JavaScript 文件，配置等。

### 程序逻辑

#### 1. 与 neocortex 服务通信

`<@facade />` 每次运行的时候，都会将 `mod` 加入到 `modList` 中

在程序向客户端传输响应之前，业务 web 会向 neocortex 服务器请求，发送如下信息：
	
	- 当前页面的 uniq 标识
	- modList 的内容，假若 modlist 包含如下内容 `['a@0.0.1', 'b@0.0.2']`

假若，有如下的依赖关系：

	"a@0.0.1" -> []
	"b@0.0.2" -> ["a@0.0.2", "c@0.1.0"]

neocortex 服务器会以 `JSON` 格式返回响应，包含如下结构：

	{
		"request_modules": {
			"a": "0.0.1",
			"b": "0.0.2"
		},
		
		"modules": ["a@0.0.1", "a@0.0.2", "b@0.0.2", "c@0.1.0"],
		
		"combos": [
			["a@0.0.1", "a@0.0.2", "b@0.0.2"],
			["c@0.1.0"]
		]
	}
	
将 `JSON` 赋值为 `modules`
	

#### 2. 输出响应	

##### 页面准备

首先，我们先说明页面中几个重要的 placeholder
	
	top_framework: 位于 <head></head> 中的的 JavaScript 脚本占位符
	
	top_src      : 紧跟在 <top_framework> 代码块后面
	
	bottom_framework: 这部分占位符在 </body> 标签之前，位于页脚所有 JavaScript 脚本的最前面
	
	bottom_src      : 紧跟在 <bottom_framework> 代码块后面，<bottom_facades> 代码块前面
	 
	bottom_facades

##### 逻辑

##### 门面

`<@facade />` 的输出中，如下的代码将插入到 <bottom_facades> 占位符中：
	
	facade({
		mod  : ${module_identifier},
		data : ${init_data}
	});
	
如果有多个模块，则输出多个上面的代码片段

##### 基础框架及配置

将 `f2e_framework_code` 输出到 <bottom_framework> 

默认情况下，输出

##### 模块资源文件

遍历数组 `modules.combos` 中的项，每个项也是一个数组，

- 若数组长度为 1，则应用 `url_pattern` 转换为模块 JavaScript 的绝对地址。
- 若数组长度大于 1，则应用 `combo_url_pattern` 规则

由此生成一个新的数组 `module_combo_urls`

若为 IE 浏览器，并且 IE < 10，则在 <bottom_src> 页面中输出:

	<script>
	[<#list module_combo_urls as url>'${url}'</#list><#if url_has_next>, </#if>].forEach(f	unction(url){
		var d = document,
			h = d.getElementsByTagName('head')[0],
			n = d.createElement('script');
    
    	n.src = src;
    	h.insertBefore(n, h.firstChild);
	});
	</script>
	
转换后的代码。
	
若为其他浏览器，则在 <bottom_src> 页面中输出:

	<#list module_combo_urls as url>
	<script async src="${url}" /></script>
	</#list>
