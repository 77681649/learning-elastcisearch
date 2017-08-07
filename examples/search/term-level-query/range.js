/**
 * 1. 查询价格为(20,40)的产品
 */
GET /my_store/products/_search
{
  "query":{
    "range":{
      "price" : { "gt" : 20 , "lt" : 40  }
    }
  }
}