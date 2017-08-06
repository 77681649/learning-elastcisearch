[[query-dsl-terms-query]]
=== Terms Query ( 多词条查询 )

Filters documents that have fields that match any of the provided terms
(*not analyzed*).
过滤出指定字段中能匹配提供的词条列表中任意一词条的文档.

For example:
例如:

[source,js]
--------------------------------------------------
GET /_search
{
    "query": {
        "constant_score" : {
            "filter" : {
                "terms" : { "user" : ["kimchy", "elasticsearch"]}
            }
        }
    }
}
--------------------------------------------------
// CONSOLE

The `terms` query is also aliased with `in` as the filter name for simpler usage deprecated[5.0.0,use `terms` instead].
`terms`查询为了便于使用,也能使用别名"in"作为过滤器的名称 ( 5.0.0 弃用 )

[float]
[[query-dsl-terms-lookup]]
===== Terms lookup mechanism ( terms 查询机制 )

When it's needed to specify a `terms` filter with a lot of terms it can be beneficial to fetch those term values from a document in an index.
指定有很多词条的`terms`过滤器时,从索引的一个文档中获取词条的值是很有利的.

A concrete example would be to filter tweets tweeted by your followers. Potentially the amount of user ids specified in the terms filter can be a lot.In this scenario it makes sense to use the terms filter's terms lookup mechanism.
一个具体的例子,筛选出你的粉丝发的文博.指定在'terms'筛选器中,潜在的用户Ids的数量可能很多.在这种情况下,使用`terms`筛选器的词条查询机制是有意义的.

The terms lookup mechanism supports the following options:
词条查询机制提供以下选项 :

[horizontal]
`index`::
    The index to fetch the term values from. Defaults to the current index.
    指定获取词条值的索引.默认是当前索引.

`type`::
    The type to fetch the term values from.
    指定获得词条值的文档类型.

`id`::
    The id of the document to fetch the term values from.
    指定获得词条值的文档id

`path`::
    The field specified as path to fetch the actual values for the `terms` filter.
    指定为`terms`筛选器获得实际值的路径

`routing`::
    A custom routing value to be used when retrieving the external terms doc.
    当检索分片外的词条文档时,自动的路由值

The values for the `terms` filter will be fetched from a field in a document with the specified id in the specified type and index.Internally a get request is executed to fetch the values from the
specified path. At the moment for this feature to work the `_source` needs to be stored.
`terms`筛选器的值将从指定索引的指定文档类型的指定的文档中的指定字段中获取.在内部执行一个请求,从指定的路径中获取值.这个特性工作时,`_source`需要被存储下来.

Also, consider using an index with a single shard and fully replicated across all nodes if the "reference" terms data is not large. The lookup
terms filter will prefer to execute the get request on a local node if possible, reducing the need for networking.
同时,如果引用词条的数据量不是很大,请考虑使用带有单个分片的索引并在所有节点上完全复制.terms筛选器的查询机制,将尽可能的在本地节点中执行,以减少对网络的需求.

[float]
===== Terms lookup twitter example ( terms 查询微博的例子 )
At first we index the information for user with id 2, specifically, its followers,
首先,我们为id为2的用户索引一些信息,即它的粉丝.

then index a tweet from user with id 1.
然后,索引一条用户1发的微博

Finally we search on all the tweets that match the followers of user 2.
最后,我们搜索出,用户2的粉丝的所有粉丝的微博.

[source,js]
--------------------------------------------------
PUT /users/user/2
{
    "followers" : ["1", "3"]
}

PUT /tweets/tweet/1
{
    "user" : "1"
}

GET /tweets/_search
{
    "query" : {
        "terms" : {
            "user" : {
                "index" : "users",
                "type" : "user",
                "id" : "2",
                "path" : "followers"
            }
        }
    }
}
--------------------------------------------------
// CONSOLE

The structure of the external terms document can also include an array of inner objects,
外部词条文档的结构还可以包含内部对象的数组,

for example:
例如 :

[source,js]
--------------------------------------------------
PUT /users/user/2
{
 "followers" : [
   {
     "id" : "1"
   },
   {
     "id" : "2"
   }
 ]
}
--------------------------------------------------
// CONSOLE

In which case, the lookup path will be `followers.id`.
