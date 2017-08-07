[[query-dsl-bool-query]]
=== Bool Query ( 布尔查询 )

A query that matches documents matching boolean combinations of other
queries. 
用于
匹配其他查询的布尔组合

The bool query maps to Lucene `BooleanQuery`. 
布尔查询映射为Lucene的`BooleanQuery`

It is built using one or more boolean clauses, each clause with a typed occurrence. The occurrence types are:
它使用一个或多个布尔子句构建,每个子句都有一个类型:

[cols="<,<",options="header",]
|=======================================================================
|Occur |Description
|`must` |The clause (query) must appear in matching documents and will
contribute to the score.
`must`子句(查询)中的条件必须出现在匹配的文档中,同时该子句还将为相关性评分做出贡献.

|`filter` |The clause (query) must appear in matching documents. However unlike `must` the score of the query will be ignored. Filter clauses are executed in <<query-filter-context,filter context>>, meaning that scoring is ignored and clauses are considered for caching.
`filter`子句(查询)中的条件必须出现在匹配的文档中.然而,与`must`子句不同的是查询的相关性评分将被忽略 (不会影响文档相关性评分).`filter`子句在`过滤模式`执行,这意味着,评分被忽略,以及子句的结果可能被缓存.

|`should` |The clause (query) should appear in the matching document. If the `bool` query is in a <<query-filter-context,query context>> and has a `must` or `filter` clause then a document will match the `bool` query even if none of the `should` queries match. In this case these clauses are only used to influence the score. If the `bool` query is a <<query-filter-context,filter context>> or has neither `must` or `filter` then at least one of the `should` queries must match a document for it to match the `bool` query. This behavior may be explicitly controlled by settings the <<query-dsl-minimum-should-match,`minimum_should_match`>> parameter.
`should`子句(查询)中的条件可能出现在匹配的文档中.
  * 如果`bool`查询在`查询模式`下,并且包含`must`或`filter`子句,那么一个文档是否匹配,将不会受`should`子句的影响.这种情况下,`should`子句仅会影响分数(而不会影响匹配文档).
  * 如果`bool`查询在`过滤模式`下或者既没有`must`子句,也没有`filter`子句,那么,匹配任意一个`should`子句的文档,就算作匹配文档.这种行为也许可以通过设置`minimum_should_match`参数来显式控制.

|`must_not` |The clause (query) must not appear in the matching
documents.  Clauses are executed in <<query-filter-context,filter context>> meaning that scoring is ignored and clauses are considered for caching. Because scoring is ignored, a score of `0` for all documents is returned.
`must_not`子句(查询)中的条件一定不能出现在匹配的文档中.子句运行在`过滤模式`
,这意味着,评分被忽略,以及子句的结果可能被缓存.因为评分被忽略,为所有返回的文档设置一个`0"的评分.

|=======================================================================

[IMPORTANT]
.Bool query in filter context ( bool查询在过滤模式中运行 )
========================================================================
If this query is used in a filter context and it has `should` clauses then at least one `should` clause is required to match.
如果查询用于过滤模式,并且它有一个`should`子句,那么必须至少匹配一个`should`子句.
========================================================================

The bool query also supports `disable_coord` parameter (defaults to
`false`) which changes how the `classic` similarity calculates the `bool` query's score. Basically the coord similarity computes a score factor based on the fraction of all query terms that a document contains. 
`bool`查询页支持`disable_coord`参数(默认为`false`),它能改变`classic`相似度如何计算`bool`查询的评分.基本上,coord相似度是基于文档包含的所有查询词条的分数来计算分数因子的.

See Lucene `BooleanQuery` for more details.
更多细节请查看Lucene `BooleanQery`.

The `bool` query takes a _more-matches-is-better_ approach, so the score from each matching `must` or `should` clause will be added together to provide the final `_score` for each document.
`bool`查询采取"匹配越多越好"的评分策略,因此,每个文档最终的`_score`来自每个匹配的`must`子句或`should`子句的分数总和.

[source,js]
--------------------------------------------------
POST _search
{
  "query": {
    "bool" : {
      "must" : {
        "term" : { "user" : "kimchy" }
      },
      "filter": {
        "term" : { "tag" : "tech" }
      },
      "must_not" : {
        "range" : {
          "age" : { "gte" : 10, "lte" : 20 }
        }
      },
      "should" : [
        { "term" : { "tag" : "wow" } },
        { "term" : { "tag" : "elasticsearch" } }
      ],
      "minimum_should_match" : 1,
      "boost" : 1.0
    }
  }
}
--------------------------------------------------
// CONSOLE

==== Scoring with `bool.filter` ( `bool.filter`的评分 )

Queries specified under the `filter` element have no effect on scoring -- scores are returned as `0`.  Scores are only affected by the query that has been specified.  
`filter`元素下指定的查询都不会影响评分 -- 评分都将返回`0`.评分仅仅受指定的查询的影响.

For instance, all three of the following queries return all documents where the `status` field contains the term `active`.
例如,以下三个查询都是 , 返回所有`status`字段中包含`active`词条的查询.

This first query assigns a score of `0` to all documents, as no scoring query has been specified:
第一个查询所有的文档都分配到`0`评分,因为指定了没有评分的查询:
[source,js]
---------------------------------
GET _search
{
  "query": {
    "bool": {
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
---------------------------------
// CONSOLE

This `bool` query has a `match_all` query, which assigns a score of `1.0` to all documents. 
`bool`查询有为所有匹配文档分配`1.0`评分的`match_all`查询.

[source,js]
---------------------------------
GET _search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
---------------------------------
// CONSOLE

This `constant_score` query behaves in exactly the same way as the second example above.The `constant_score` query assigns a score of `1.0` to all documents matched by the filter.
`constant_score`查询的行为与上面的第二个例子完全相同.`constanct_score`查询为通过所有通过筛选器匹配的文档分配`10.0的评分.


[source,js]
---------------------------------
GET _search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
---------------------------------
// CONSOLE

==== Using named queries to see which clauses matched ( 使用命名查询,查看子句的匹配情况 )

If you need to know which of the clauses in the bool query matched the documents returned from the query, you can use
<<search-request-named-queries-and-filters,named queries>> to assign a name to each clause.
如果你需要知道,bool查询中那个子句与查询返回的文档匹配,那么可以使用命名查询为每个子句分配一个名字.