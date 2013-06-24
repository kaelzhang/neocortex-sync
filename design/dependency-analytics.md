# 依赖分析及打包策略

本文档说明如何获取所有的依赖项及应用打包策略，最后得到 `modules`.

若对于已经存在的 `modList`

### 参数定义

为了让之后的描述不至于混乱，

##### Package
`String` 指的是包（或模块）的名字，比如 `"a"`.

##### Version
`String` 包的版本，如 `"0.0.1"`.

##### Module
`String` 指的是完整的包含模块名字和版本的描述，如 `"a@0.0.1"`.

##### url_pattern
`String`

用于生成模块 idenfitier 生成资源的 url，比如
`'{domains}/mod/{module}/{version}/index.js'`

##### combo_url_pattern
`String`

用于将多个模块生成成 combo 文件的 pattern

### 1. 获取依赖关系

假若，有如下的依赖关系：

    "a@0.0.1" -> ["c@0.0.1", "e0.2.1"]
    "b@0.0.2" -> ["d@0.0.2", "d@0.1.0", "e@0.2.1", "f@0.0.1"]

数据库表 CM_cortexDependencies，其中包含如下字段：

| Package | Version | Dependencies                    |
| ------- | ------- | ------------------------------- |
| a       | 0.0.1   | c@0.0.1,e0.2.1                  |
| b       | 0.0.2   | d@0.0.2,d@0.1.0,e@0.2.1,f@0.0.1 |

其中 `Dependencies` 字段会包含所有模块的递归依赖，也就是说，服务器端程序不需要递归地查询模块的依赖。

服务器端程序，需要将 `'a@0.0.1'` 和 `'b0.0.2'` 的依赖合并，并去除重复之后，赋值给 `modules`。 

### 2. 获取打包策略

在相当长的时间内（预计可以），我们的打包策略先不加入 "版本" 这一维度。这样，算法端及服务器端的实现都会比较简单。

我们有数据库表 CM_cortexCombos，其中包含如下字段：

| Package | ComboId |
| ------- | ------- |
| a       | 1       | 
| b       | 1       |

为了简化模型，我们约定：

1. 一个模块，只会存在于一个 Combo 中。

#### 程序逻辑

##### 方案 1

可以讨论一下如何可以简化这个逻辑：

1. 从 `modules` 中获取每一个模块的模块名 `package` 到集合 `packages` 中。
2. 从 CM_cortexCombos 中读取每一个 `package` 对应的 `ComboId`（如果没有该记录，则标记该模块没有 ComboId ）
3. 依据 `ComboId` 将 `packages` 进行分组，将没有 `ComboId` 的模块分为一个特殊的组。
4. 将 `modules` 中的版本，应用到分组信息中。若一个在 `modules` 中，一个同名模块包含多个版本，则都应用进去。

以上的步骤，属于 <方案1>
****

5. 经过上面的步骤，我们得到如下的数据结构（使用 JSON 来描述）

```js
combo_info = {
	combos: [
		["a@0.0.1", "b@0.0.2"],
		["c@0.0.1", "d@0.0.2", "d@0.1.0"]
	],
	
	no_combos: ["e@0.2.1", "f@0.0.1"]
}
```



6. 遍历数组 `combo_info.combos` 中的每一项，每个项也是一个数组，

- 若数组长度为 1，则应用 `url_pattern` 转换为模块 JavaScript 的绝对地址，push 到数组 `module_combo_urls` 中。
- 若数组长度大于 1，则应用 `combo_url_pattern` 规则，转换为绝对地址，push 到数组 `module_combo_urls` 中。

7. 将 `combo_info.no_combos` 中的项，应用 `url_pattern`，push 到数组 `module_combo_urls` 中。

结束。








