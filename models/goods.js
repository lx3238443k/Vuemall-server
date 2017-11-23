var mongoose = require('mongoose');
var Schema =mongoose.Schema;
var productSchema = new Schema({
	"productId":String,
	"productName":String,
	"productImg":String,
	"productPrice":Number,
	"checked":Number,
	"productNum":Number
});

module.exports = mongoose.model('Good',productSchema,'goods');
