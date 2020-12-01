const { Double } = require('bson');
var mongoose=require('mongoose');
var Schema = mongoose.Schema;

const confiq=require('../config/config').get(process.env.NODE_ENV);

const driverSchema=mongoose.Schema({
    name:{
        type: String,
        required: true,
        maxlength: 100
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone_number:{
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
              return /\d{10}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
          }
      
    },
    license_number:{
        type: String,
        required: true,
        unique: true
    },
    car_number:{
        type: String,
        required: true,
        unique: true
    },
    latitude:{
        type: Number
    },
    longitude:{
        type: Number,
    }
});

module.exports=mongoose.model('driver',driverSchema);