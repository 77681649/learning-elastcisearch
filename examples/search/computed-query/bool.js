/**
 * 1. 嵌套的复合查询
 * SELECT document 
 * FROM my_store.products
 * WHERE productID = "KDKE-B-9947-#kL5"
 *  OR ( productID = "JODL-X-1937-#pV7" AND price = 30 )
 */
GET /my_store/products/_search
{
  "query" : {
    "bool" : {
      "should" : [
        {
          "term" : {"productID" : "KDKE-B-9947-#kL5"}
        },
        {
          "bool" : {
            "must" : [
              {"term" : {"productID" : "JODL-X-1937-#pV7"}},
              {"term" : {"price" : 30}}
            ]
          }
        }
      ]
    }
  }
}



/**
 * 2. 找出 productID = "KDKE-B-9947-#kL5" 或者 price = "30"  的产品
 */
GET /my_store/products/_search
{
  "query":{
    "bool":{
      "filter":{
        "bool":{
          "should":[
            {"term" : {"productID" : "KDKE-B-9947-#kL5"}},
            {"term" : {"price" : 30}}
          ]
        }
      }
    }
  }
}