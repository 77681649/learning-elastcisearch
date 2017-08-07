[[query-dsl-range-query]]
=== Range Query ( 范围查询 )

Matches documents with fields that have terms within a certain range.
The type of the Lucene query depends on the field type, for `string`
fields, the `TermRangeQuery`, while for number/date fields, the query is
a `NumericRangeQuery`. 
匹配字段的词条在一定范围内的文档.Lucene查询的依赖取决于字段的类型 :
  * `string`      -- `TermRangeQuery`
  * `number/date` -- `NumericRangeQuery`

The following example returns all documents where `age` is between `10` and `20`:
下面的例子,返回年龄在`10`到`20`之间的文档:
[source,js]
--------------------------------------------------
GET _search
{
    "query": {
        "range" : {
            "age" : {
                "gte" : 10,
                "lte" : 20,
                "boost" : 2.0
            }
        }
    }
}
--------------------------------------------------
// CONSOLE 

The `range` query accepts the following parameters:
`range`查询接收以下参数:

[horizontal]
`gte`:: 	Greater-than or equal to
`gt`::  	Greater-than
`lte`:: 	Less-than or equal to
`lt`::  	Less-than
`boost`:: 	Sets the boost value of the query, defaults to `1.0`

[[ranges-on-dates]]
==== Ranges on date fields ( 日期字段范围 )

When running `range` queries on fields of type <<date,`date`>>, ranges can be specified using <<date-math>>:
当在日期类型的字段上运行`range`查询时,可以使用`Date Math`指定日期范围:

[source,js]
--------------------------------------------------
GET _search
{
    "query": {
        "range" : {
            "date" : {
                "gte" : "now-1d/d",
                "lt" :  "now/d"
            }
        }
    }
}
--------------------------------------------------
// CONSOLE

===== Date math and rounding ( date-math和日期舍入 )

When using <<date-math,date math>> to round dates to the nearest day, month, hour, etc, the rounded dates depend on whether the ends of the ranges are inclusive or exclusive.
当使用`date-math`将日期舍到最近的天,月,小等时,舍入日期取决于范围的结尾是否包含在内.

Rounding up moves to the last millisecond of the rounding scope, and rounding down to the first millisecond of the rounding scope. 
  * 向上舍入的上界 : 舍入到舍入范围的最后一秒
  * 向下舍入的下界 : 舍入到舍入范围的第一秒

For example:
例如 : 

[horizontal]
`gt`::
    Greater than the date rounded up: `2014-11-18||/M` becomes
    `2014-11-30T23:59:59.999`, ie excluding the entire month.
    大于 向上舍入的日期 : 
      `2014-11-18||/M` 变为 `2014-11-30T23:59:59.999`,排除整整一个月

`gte`::
    Greater than or equal to the date rounded down: 
      `2014-11-18||/M` becomes `2014-11-01`, ie including the entire month.
    大于或等于 向下舍入的日期 : 
      `2014-11-18||/M` 变为 `2014-11-01 00:00:00` , 包含整整一个月
`lt`::
    Less than the date rounded down: 
      `2014-11-18||/M` becomes `2014-11-01`, ie excluding the entire month.
    小于 向下舍入的日期 : 
      `2014-11-18||/M` 变为 `2014-11-01 00:00:00` , 排除整整一个月

`lte`::

    Less than or equal to the date rounded up: 
      `2014-11-18||/M` becomes `2014-11-30T23:59:59.999`, ie including the entire month.
    小于或等于 向上舍入的日期 : 
      `2014-11-18||/M` 变为 `2014-11-30T23:59:59.999`,包含整整一个月

===== Date format in range queries ( 在range查询中的日期格式 )

Formatted dates will be parsed using the <<mapping-date-format,`format`>> specified on the <<date,`date`>> field by default, but it can be overridden by passing the `format` parameter to the `range` query:
默认情况下,格式化的日期将使用日期字段的`format`属性解析,但是你能通过将`format`参数传递给`range`查询来覆盖它.

[source,js]
--------------------------------------------------
GET _search
{
    "query": {
        "range" : {
            "born" : {
                "gte": "01/01/2012",
                "lte": "2013",
                "format": "dd/MM/yyyy||yyyy"
            }
        }
    }
}
--------------------------------------------------
// CONSOLE 

===== Time zone in range queries ( 在range查询中的时区 )

Dates can be converted from another timezone to UTC either by specifying the time zone in the date value itself (if the <<mapping-date-format, `format`>> accepts it), or it can be specified as the `time_zone` parameter:
既可以通过在日期值中指定时区,也可以通过制定`time_zone`参数,将日期从另一个时区转换为UTC时间.

[source,js]
--------------------------------------------------
GET _search
{
    "query": {
        "range" : {
            "timestamp" : {
                "gte": "2015-01-01 00:00:00", <1>
                "lte": "now", <2>
                "time_zone": "+01:00"
            }
        }
    }
}
--------------------------------------------------
// CONSOLE
<1> This date will be converted to `2014-12-31T23:00:00 UTC`.
<2> `now` is not affected by the `time_zone` parameter (dates must be stored as UTC).