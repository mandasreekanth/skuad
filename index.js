const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const Driver=require('./models/driver');
const db=require('./config/config').get(process.env.NODE_ENV);
const app=express();
const { check } = require("express-validator");
const { validationResult } = require("express-validator");
const async = require("async");
const haversine = require('haversine')

// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    console.log("database is connected");
});


// adding new driver (sign-up route)
app.post('/api/v1/driver/register/',function(req,res){
    // taking a driver
    const newdriver=new Driver(req.body);
    console.log(newdriver);
    Driver.findOne({email:newdriver.email},function(err,driver){
        if(driver) return res.status(400).json({ auth : false, message :"email exits"});
        newdriver.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ "success" : "failure",
                "reason":err});}
            res.status(200).json({
                succes:true,
                driver : doc
            });
        });
    });
 });

 app.post('/api/v1/driver/:id/sendLocation/',
 [check("longitude").not().isEmpty().withMessage("Field is required"),check("latitude").not().isEmpty().withMessage("Field is required")],
                            function(req,res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({
            status: "error",
            message: "Invalid request",
            statusCode: 422,
            data: {},
            errors: errors.array(),
          });
        }
        let data = req.body;
        var saveObj = {};
        saveObj.longitude= data.longitude;
        saveObj.latitude= data.latitude;
        Driver.updateOne(
          {
            _id :req.params.id
          },
          saveObj,
          function (err, updateddriver) {
            if (err) {
              res.status(400).json({
                status: "Failure",
                statusCode: 400,
                reason:err
              });
            } else {
              res.status(200).json({
                status: "success",
                statusCode: 200,
                message: "successfully store the location",
                data: {},
              });
             }
          }
        );
})

app.post('/api/v1/passenger/available_cabs/',
 [check("longitude").not().isEmpty().withMessage("Field is required"),check("latitude").not().isEmpty().withMessage("Field is required")],
                            function(req,res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({
            status: "error",
            message: "Invalid request",
            statusCode: 422,
            data: {},
            errors: errors.array(),
          });
        }
        var driversList =[];
        Driver.find().then((response) => {
            async.eachSeries(
              response,
              function (value, cback) {
                if(value.latitude != undefined && value.longitude !=undefined ){
              var driverLocation ={
                "latitude": value.latitude,
                "longitude":value.longitude
              }    
              console.log(driverLocation);
              const userLocation ={
                "latitude":req.body.latitude,
                "longitude":req.body.longitude
              } 
              console.log(haversine(driverLocation,userLocation));
              if(haversine(driverLocation,userLocation) <=4){
                driversList.push(value);
              }
            }
                cback();
              },
              function (err) {
                if (err) {
                  res.status(400).send({
                    status: "error",
                    statusCode: 400,
                    reason: err.message,
                    data: {},
                  });
                } else {
                  if(driversList.length == 0){
                    res.status(200).json({
                      status: "succuess",
                      statusCode: 200,
                      message:"No cabs available!"
                    });
                  }else{
                  res.status(200).json({
                    status: "succuess",
                    statusCode: 200,
                    message: "driversList",
                    data: driversList,
                  });
                }
                }
              }
            );
          })
          
      }

)   

// listening port
const PORT=process.env.PORT||8080;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});