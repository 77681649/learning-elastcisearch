[[query-dsl-term-query]]
=== Term Query ( 词条查询 )

The `term` query finds documents that contain the *exact* term specified
in the inverted index.  For instance:

"term"查询 从指定的倒排索引中,找出包含精准词条(字段)的文档

[source,js]
--------------------------------------------------
POST _search
{
  "query": {
    "term" : { "user" : "Kimchy" } <1>
  }
}
--------------------------------------------------
// CONSOLE
<1> Finds documents which contain the exact term `Kimchy` in the inverted index of the `user` field.
在`user`字段的倒排索引中,找出包含精准词条`Kimchy`的文档.

A `boost` parameter can be specified to give this `term` query a higher relevance score than another query,for instance:
`boost`参数能给`term`查询指定一个比其他查询更高的相关度评分,例如:

[source,js]
--------------------------------------------------
GET _search
{
  "query": {
    "bool": {
      "should": [
        {
          "term": {
            "status": {
              "value": "urgent",
              "boost": 2.0 <1>
            }
          }
        },
        {
          "term": {
            "status": "normal" <2>
          }
        }
      ]
    }
  }
}
--------------------------------------------------
// CONSOLE

<1> The `urgent` query clause has a boost of `2.0`, meaning it is twice as important as the query clause for `normal`.
`urgent`查询子句有`2.0`的boost参数,这意味它的重要性是`normal`查询子句的两倍.

<2> The `normal` clause has the default neutral boost of `1.0`.
`normal`子句具有`1.0`的默认的中性boost.

.Why doesn't the `term` query match my document? ( 为什么`term`查询不匹配我的文档 ? )
**************************************************

String fields can be of type `text` (treated as full text, like the body of an email), or `keyword` (treated as exact values, like an email address or a zip code).

Exact values (like numbers, dates, and keywords) have
the exact value specified in the field added to the inverted index in order to make them searchable.

字符串字段可以是
  * `text`类型 (它被当做全文值,如电邮的主体),
  * `keyword`类型 (它被当做精准值,如电邮类型或邮政编码)
精准值字段中的具体精准值(数字,日期,关键字)将被添加到倒排索引,使得它们能被搜索出来.

However, `text` fields are `analyzed`. This means that their values are first passed through an<<analysis,analyzer>> to produce a list of
terms, which are then added to the inverted index.
然而,`text`字段是会被`分析的`.这意味着,它们的值会经过一个分析器生成一个词条列表,然后词条列表中的词条将被添加到倒排索引.

There are many ways to analyze text: the default
<<analysis-standard-analyzer,`standard` analyzer>> drops most punctuation,breaks up text into individual words, and lower cases them.
For instance, the `standard` analyzer would turn the string ``Quick Brown Fox!'' into the
terms [`quick`, `brown`, `fox`].
有许多分析文本的方式 , 默认`standrad`分析器
  * 过滤掉大多数的标点符号
  * 将文本拆分为单个单词,并且将其转换为小写
例如,`standard`分析器将字符串"Qucik Brown Fox!"转换为词条 [`quick`, `brown`, `fox`].

This analysis process makes it possible to search for individual words within a big block of full text.
分析过程使得可以在大块全文中进行单个单词的搜索.

The `term` query looks for the *exact* term in the field's inverted index -- it doesn't know anything about the field's analyzer. This makes it useful for
looking up values in keyword fields, or in numeric or date
fields.
`term`查询在字段的倒排索引中搜索**精准**词条 -- 它对字段分析器一无所知.这使得它可以用于从关键字字段,数值字段或日期字段中搜索值.

When querying full text fields, use the
<<query-dsl-match-query,`match` query>> instead, which understands how the field has been analyzed.
当查询全文字段时,应该使用了解如何分析字段的`match`查询代替`term`查询.

To demonstrate, try out the example below.
First, create an index, specifying the field mappings, and index a document:
为了演示以上说的,请尝试以下示例.
首先,创建一个指定字段映射的索引,以及索引一个文档.

[source,js]
--------------------------------------------------
PUT my_index
{
  "mappings": {
    "my_type": {
      "properties": {
        "full_text": {
          "type":  "text" <1>
        },
        "exact_value": {
          "type":  "keyword" <2>
        }
      }
    }
  }
}

PUT my_index/my_type/1
{
  "full_text":   "Quick Foxes!", <3>
  "exact_value": "Quick Foxes!"  <4>
}
--------------------------------------------------
// CONSOLE

<1> The `full_text` field is of type `text` and will be analyzed.
`full_text`字段是`text`类型的,它将被分析.

<2> The `exact_value` field is of type `keyword` and will NOT be analyzed.
`exact_value`字段是`keyword`字段,它不会被分析.

<3> The `full_text` inverted index will contain the terms: [`quick`, `foxes`].
`full_text`倒排索引中将包含词条列表:[`quick`, `foxes`].

<4> The `exact_value` inverted index will contain the exact term: [`Quick Foxes!`].
`exact_value`倒排索引中将包含精准词条:[`Quick Foxes!`].

Now, compare the results for the `term` query and the `match` query:
现在,让我们来比较一下`term`查询和`match`查询的结果:

[source,js]
--------------------------------------------------
GET my_index/my_type/_search
{
  "query": {
    "term": {
      "exact_value": "Quick Foxes!" <1>
    }
  }
}

GET my_index/my_type/_search
{
  "query": {
    "term": {
      "full_text": "Quick Foxes!" <2>
    }
  }
}

GET my_index/my_type/_search
{
  "query": {
    "term": {
      "full_text": "foxes" <3>
    }
  }
}

GET my_index/my_type/_search
{
  "query": {
    "match": {
      "full_text": "Quick Foxes!" <4>
    }
  }
}
--------------------------------------------------
// CONSOLE
// TEST[continued]

<1> This query matches because the `exact_value` field contains the exact term `Quick Foxes!`.
1. 查询能匹配到文档,因为`exact_value`字段包含精准词条`Quick Foxes!`.

<2> This query does not match, because the `full_text` field only contains the terms `quick` and `foxes`. It does not contain the exact term `Quick Foxes!`.
2. 查询不能匹配到文档,因为`full_text`字段仅包含词条`quick` 和 `foxes`.它不包含精准词条`Quick Foxes!`.

<3> A `term` query for the term `foxes` matches the `full_text` field.
3. `term`查询的`foxed`词条能匹配`full_text`字段.

<4> This `match` query on the `full_text` field first analyzes the query string,then looks for documents containing `quick` or `foxes` or both.
4. `full_text`字段上的`match`查询,首先会分析指定的查询字符串("Quick Foxes" , 使用分析器拆分为词条 ) , 然后找出包含`quick`或`foxes`或者两者都包含的文档.

**************************************************
