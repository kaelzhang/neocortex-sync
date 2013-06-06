# 依赖分析方案

### 前述

每一个模块，都会包含一个 package.json，它的作用是描述当前模块的版本、依赖以及其他信息，相当于 maven 的 pom.xml。

### package.json 说明

package.json 包含以下属性（以下仅列举与本项目相关的属性）,

以 "async" 模块为例：

	{
		name: "async",
		version: "0.1.0",
		cortexExactDependencies: {
			"a": "0.1.2",
			"b": "2.0.1"
		}
	}
	
## 依赖分析

新的依赖分析方案中，不再对代码进行分析，而完全使用 package.json 文件来进行分析。

#### 说明
依赖分析，需要同时分析依赖的模块名及当前依赖的版本。

#### 可能方案

不进行递归的分析，而是在发布 npm server 之前，对 `dependencies` 进行 [shrinkwrap](https://npmjs.org/doc/shrinkwrap.html)

