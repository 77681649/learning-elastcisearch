[[query-dsl-constant-score-query]]
=== Constant Score Query ( 固定评分查询 )

A query that wraps another query and simply returns a constant score equal to the query boost for every document in the filter. Maps to Lucene `ConstantScoreQuery`.
一个用来包裹其他查询的查询,同时简单地为过滤器中的每个文档返回一个等于查询`boost`参数的常量评分. 映射为 Lucene `ConstantScoreQuery`.

[source,js]
--------------------------------------------------
GET /_search
{
    "query": {
        "constant_score" : {
            "filter" : {
                "term" : { "user" : "kimchy"}
            },
            "boost" : 1.2
        }
    }
}
--------------------------------------------------
// CONSOLE

Filter clauses are executed in <<query-filter-context,filter context>>, meaning that scoring is ignored and clauses are considered for caching.
过滤子句在`过滤上下文`中执行,这意味着评分操作将被忽略,同时子句结果可能被缓存.