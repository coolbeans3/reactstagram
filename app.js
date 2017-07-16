var express = require("express");
var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var mongojs = require("mongojs");
var db = mongojs("localhost:27017/reactstagram", ['image', 'comment', 'user']);

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require('body-parser');
app.use(bodyParser());

var authentication = require('./libs/auth.js');//. gives you current directory
var extra = require('./libs/extra.js');

var fs = require('fs')

var base64Img = require('base64-img');

app.use("/public", express.static('public'))

app.post("/user/signup", function (req,res){
    var username = req.body.username;
    var password = req.body.password;
    db.user.findOne({username:username}, function(err,docs){
        if (err){
            return res.send({status: 404, message: "Server Death. RIP."});
        }
        else if(docs != null){
            return res.send({status: 404, message: "Choose another username lmao unoriginal"});
        }
        else{
             if (username == null || password.length < 5){
                return res.send({status: 404, message: "A better username or password pls"});
             }
            
            else{
                var session = authentication.generateGUID();
                db.user.save({username:username, password:password}, {session:session}, function(err,docs){
                    if (!err){
                        return res.send({status: 200, username:username, session:session, message:"welcome brotha"});
                    }
                });
            }  
        }

    });
});

app.post("/user/login", function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    db.user.findOne({username:username}, function(err,docs){
        if(err){
            return res.send({status: 404, message: "Server Death. RIP."});
        }
        else if(docs == null || docs.length == 0 || password != docs.password){
            return res.send({status: 404, message: "Invalid username or password"});
        }
        else{
            var session = authentication.generateGUID();
            db.user.update({username:username}, {$set:{session:session}}, function(err,docs2){
                if (!err){
                    res.cookie("session", session, {httpOnly:true});
                    res.send({status:200, data:{session:session, userid: docs._id}});
                } else{
                    res.send({status:403})
                }
            });
            
        }
    });
});

app.get("/playing_with_cookies", function(req, res){
    var session = req.cookies.session; //takes out session value from cookies
    var number = req.cookies.number;
    if (number == null){
        number = 0;
    }else{
        number = parseInt(number) + 1;
    }
    if (session == null){ //no cookies detected
       res.cookie("session", "a cookie", {httpOnly:true});
       return res.send("No cookies detected");
    }
    else{
        res.cookie("number", number, {httpOnly:true});
        return res.send("Cookies refreshed: " + number);
    }
    
});

app.get("/test_signed_in", authentication.ensureSignedIn, function(req,res){//get object in authentication
    res.send("yoyowhaddup");
});


app.post("/image", function(req,res){
    console.log("Image requested");
    
    var userID = req.body.userID;
    var text = req.body.text;
    var image = req.body.image;
    
    console.log(userID, text, image);
    
    if(image===null) {
        return res.send("Image not provided!");
    } else {
        console.log("image provided");
        
        db.image.save({userID: userID, text:text}, function(err, docs){
            console.log("image saved")
            base64Img.img(image, __dirname + "/public", docs._id , function(err, filepath){
                if(err){
                    return res.send({status:403, data:{message:"File cannot be saved rip"}})
                }else{
                    return res.send({status:200, data:{message:"FILE SAVED"}})
                }
                
            });
        });
        

    }
})

app.get("/allimages", function(req,res){
        db.image.find({}, function(err, docs){
            if (err){
                res.send({status:403, data:{message:"Images not found"}})
            }else{
            res.send(docs)
            }
        })
});





app.get("/extra", function(req, res){
    var dice = extra.rollDice();
    var age = extra.guessmyAge();
    var string = extra.randomTenLetterString();
    res.send ("You have thrown the dice it is: " + dice + " | Your age is " + age + " | It is this: " + string)
});

app.post("/create_file", function(req,res){
    fs.writeFile("practice.txt", "Hello filesystem", function(err){
        if(!err){
            res.send("File saved!");
        }
    })
})


app.get("/read_file", function(req,res){
    db.image.find({}, function(err,docs){
        res.send(docs);
    })
})

app.get("/update_file", function(req,res){
    var data = fs.readFileSync("practice.txt")
    fs.unlink("practice.txt", function (err){
        if(err){
            res.send("Deleting error")
        }else{
            fs.writeFile("practice.txt", data + "!", function(err){
                if(!err){
                var file = fs.readFileSync("practice.txt")
                res.send("File updated: " + file);
                }
            })
        }
    })
    
})

app.get("/update_file_v2", function(req,res){
    fs.readFile("practice.txt", function(err, data){
        fs.unlink("practice.txt", function (err){
            if (!err){
                fs.writeFile("practice.txt", data +"!", function (err){
                 if(!err){
                   fs.readFile("practice.txt", function(err, data){
                       if (!err){
                            res.send(data)
                       }
                   })
                 }
                })
            }
        })
        
    }) 
})

app.delete("/delete_file", function(req,res){
    fs.unlink("practice.txt", function (err){
        if(!err){
            res.send("File deleted!")
        }
    })
})




app.listen(8080)