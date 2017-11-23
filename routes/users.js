var express = require('express');
var router = express.Router();
require('./../util/util');
var User = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post("/login",(req,res,next)=>{
	var param = {
		userName:req.body.userName,
		userPwd:req.body.userPwd
	}
	User.findOne(param,(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message
			});
		}else{
			if(doc){
//				写cookie
				res.cookie("userId",doc.userId,{
					path:'/',
					maxAge:1000*60*60
				});
				res.cookie("userName",doc.userName,{
					path:'/',
					maxAge:1000*60*60
				});
				
//				req.session.user = doc;
				
				res.json({
					status:'0',
					msg:'',
					result:{
						userName:doc.userName
//						userPwd:doc.userPwd
					}
				});
			}
		}
	});
});

//logou 接口
router.post("/logout",(req,res,next)=>{
	res.cookie("userId","",{
		path:"/",
		maxAge:-1
	});
	res.cookie("userName","",{
		path:"/",
		maxAge:-1
	});
	res.json({
		status:'0',
		msg:'',
		result:''   
	})
});

// 检查登陆
router.get("/checkLogin",(req,res,next)=>{
	if(req.cookies.userId){
		res.json({
			status:'0',
			msg:'',
			result:req.cookies.userName || ''
		});
	}else {
		
		res.json({
			status:'1',
			msg:'未登录',
			result:''
		});
	}

});

// 查询购物车
router.get("/cartList",(req,res,next)=>{
	let userId = req.cookies.userId;
	User.findOne( {userId:userId},(err,doc)=>{
		 if(err){
		 	res.json({
		 		status:'1',
			 	msg:'r',
			 	result:''
			 });       
		 	
		 }
		 else {
		 	if(doc){
		 		 doc.cartList;
		 		 res.json({
		 		 	status:'0',
		 		 	msg:'',
		 		 	result:doc.cartList
		 		 });
		 	}
		 }
	});
});

// 删除购物车

router.post("/cartDel",(req,res,next)=>{
	let userId = req.cookies.userId;
	let productId = req.body.productId;

	User.update({userId:userId},{
		$pull:{
			'cartList':{
				'productId':productId
			}
		}
	},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else {
			res.json({
				status:'0',
				msg:'',
				result:'suc'
					
				
			});
		}
	});
});

//控制数量
router.post("/cartEdit",(req,res,next)=>{
	let userId =req.cookies.userId,
		productId =req.body.productId,
		productNum= req.body.productNum,
		checked  = req.body.checked;

	User.update({"userId":userId,"cartList.productId":productId},{
		"cartList.$.productNum":productNum,
		"cartList.$.checked":checked,

	},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else {
			res.json({
				status:'0',
				msg:'',
				result:'gxsuc'
			});
		}
	});
});

//多选
router.post("/editCheckAll",(req,res,next)=>{
	let userId = req.cookies.userId,
		checkAll = req.body.checkAll?1:0;
		console.log('checked:'+checkAll);

	User.findOne({userId:userId},(err,user)=>{
		if(err){
		res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else {
			if(user){
				user.cartList.forEach((item)=>{
					item.checked = checkAll;
				});
				user.save((err1,doc)=>{
					if(err1){
						
					}else {
						
					}
				});
			}
			res.json({
				status:'0',
				msg:'',
				result:'gxallsuc'
			});
		}
	});
});

router.get("/addressList",(req,res,next)=>{
	let userId = req.cookies.userId;
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}
		else {
			res.json({
				status:'0',
				msg:'',
				result:doc.addressList

			})
		}
	})
});

//设置默认地址
router.post("/setDefault",(req,res,next)=>{
	let userId = req.cookies.userId,
		addressId = req.body.addressId;

	if(!addressId){
		res.json({
			status:'1003',
			msg:'addressId is null',
			result:''
		})
	}
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else {
		
			let addressList = doc.addressList;
			addressList.forEach((item)=>{
					if(item.addressId == addressId){
						item.isDefault =true; 
					}else {
						item.isDefault = false;
					}
			});

			doc.save((err1,doc)=>{
				if(err1){
					res.json({
					status:'1',
					msg:err1.message,
					result:''});
			
				}
				else {
					res.json({
					status:'0',
					msg:'',
					result:''
					});
				}
			})

		}
	})
});

//删除地址
router.post("/delAddress",(req,res,next)=>{
	var userId = req.cookies.userId,
		addressId = req.body.addressId;
	User.update({userId:userId},{
		$pull:{
			'addressList':{
				'addressId':addressId
			}
			
		}
	},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else {
			res.json({
				status:'0',
				msg:'',
				result:'suc'
			});
		}
	});

});

//订单
router.post("/payMent",(req,res,next)=>{
	let userId = req.cookies.userId;
	let addressId = req.body.addressId;
	let totalPrice = req.body.totalPrice;
	let roadPrice =req.body.roadPrice;
	let sales = req.body.sales;
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}
		else {
			var address ='';
			let goodsList =[];
			// 获取地址
			doc.addressList.forEach((item)=>{
				if(addressId == item.addressId){
					address = item;
				}
			});
			// 获取商品
			
			doc.cartList.filter((item)=>{
				if(item.checked==1){
					goodsList.push(item);
				}
			});

			let r1 =  Math.floor(Math.random()*10);
			let r2 =  Math.floor(Math.random()*10);
			let platform = '323';
			let sysDate = new Date().Format('yyyyMMddhhmmss');
			let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
			let orderId = platform + r1 + sysDate +r2;
			// 创建订单
			
			var order = {
				orderId :orderId,
				totalPrice:totalPrice,
				addressInfo:address,
				goodsList:goodsList,
				orderStatus:'1',
				createDate: createDate
			};

			doc.orderList.push(order);
			doc.save((err1,doc1)=>{
				if(err1){
					// res.json({
					// 	status:'1',
					// 	msg:err1.message,
					// 	result:''
					// });
				}else {
						// res.json({
						// 	status:'0',
						// 	msg:'',
						// 	result:{
						// 		orderId:order.orderId,
						// 		totalPrice:order.totalPrice
						// 	}
						// });
				}

			})


			res.json({
				status:'0',
				msg:'',
				result:{
					orderId:order.orderId,
					totalPrice:order.totalPrice
				}
			});
		}
	})
});

// 订单信息
router.get("/orderSuc",(req,res,next)=>{
	let userId = req.cookies.userId;
	let orderId = req.param("orderId");
	let totalPrice ='';

	console.log(orderId);


	User.findOne({userId:userId},(err,doc)=>{
			if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}
		else {
			if(doc.orderList.length>0){
				doc.orderList.forEach((item)=>{
					if(item.orderId == orderId){
						totalPrice = item.totalPrice;
					}
				});
			}else {
				res.json({
				status:'0',
				msg:'no order',
				result:''
				});
			}
			res.json({
				status:'0',
				msg:'',
				result:{
					totalPrice:totalPrice
				}
			});

			console.log(totalPrice);
			

		}
	})
});

// 查询购物车数量
router.get("/getCartNum",(req,res,next)=>{
	if(req.cookies && req.cookies.userId){
		let userId = req.cookies.userId;
		User.findOne({userId:userId},(err,doc)=>{
			if(err){
				res.json({
					status:'1',
					msg:err.message,
					result:''
				});
			}else {
				let cartList = doc.cartList;
				let cartNum = 0;
				cartList.forEach((item)=>{
					cartNum += parseInt(item.productNum);     
				});
				res.json({
					status:'0',
					msg:'',
					result:cartNum
				});
			}
		})

	}



})


module.exports = router;
