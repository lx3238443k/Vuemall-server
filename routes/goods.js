var express = require('express');
var router = express.Router();

var mongoose =require('mongoose');

var Goods = require('../models/goods');


//连接mongodb
mongoose.connect('mongodb://127.0.0.1:27017/dumall');
mongoose.connection.on("connected", ()=>{

	console.log('mongodb connected success')
});

mongoose.connection.on("error", ()=>{

	console.log('mongodb connected error');
});

// select goods
router.get('/list', function(req, res, next) {

  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let sort =req.param("sort");
  let priceLevel =req.param('priceLevel');
  console.log(priceLevel);
  let skip = (page-1)*pageSize;
  var priceGt = '',priceLt = '';
  let params ={};

  if(priceLevel!='all'){
    switch (priceLevel) {
      case '0':
         priceGt = 0;priceLt= 3000;
      break;

      case '1':
        priceGt = 3000;priceLt=6000;
         
      break;
      case '2':
        priceGt = 6000;priceLt=10000;
      break;       
    
    }
    // 条件查询
    params ={
      "productPrice":{
        "$gt":priceGt,
        "$lte":priceLt
      }
    };

     
  }


  
  let goodsModel=Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'productPrice':sort});


  
 goodsModel.exec({},(err,doc)=>{
  	if(err){
  		res.json({
  			status:1,
  			msg:err.message
  		});
  	}
  	else
  	{
  		res.json({
  			status:0,
  			msg:'',
  			result:{
  				count:doc.length,
  				list:doc
  			}
  		});
  	}
  })
});


// post请求来添加数据
router.post("/addCart",(req,res,next)=>{
  var userId='1000001',productId = req.body.productId;
  var User =require('../models/user');

  User.findOne({
    userId:userId
  },(err,userDoc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message
      })
    }else {
      
    
      if(userDoc){
          // 判断是否有重复的选择
          let goodsItem = '';
          userDoc.cartList.forEach((item)=>{
            if(item.productId == productId){
              goodsItem =item;
              console.log('s'+item);
              item.productNum ++;
            }
          });
          if(goodsItem){
              userDoc.save((err2,doc2)=>{
                        if(err2){
                          res.json({
                            status:'1',
                            msg:err2.message
                          })
                        }
                        else {
                          
                          res.json({
                              status:'0',
                              msg:'nonono',
                              result:'suc'
                          })

                        }
                  });
          }
          else {
             Goods.findOne({productId:productId},(err1,doc)=>{
            if(err1){
                res.json({
                  status:'1',
                  msg:err1.message
                })
              }
              else {
                if(doc){
                  doc.productNum = 1;//坑！！
                  console.log(doc.productNum);
                  doc.checked = 1;
                  console.log(doc);
                  userDoc.cartList.push(doc);
                  userDoc.save((err2,doc2)=>{
                        if(err2){
                          res.json({
                            status:'1',
                            msg:err2.message
                          })
                        }
                        else {
                          
                          res.json({
                              status:'0',
                              msg:'nonono',
                              result:'suc'
                          })

                        }
                  });
                }
              }});
          }
         
      }


    }
  })


})
module.exports = router;

