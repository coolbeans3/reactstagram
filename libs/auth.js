var guid = require('guid');
var mongojs = require('mongojs')

function ensureSignedIn(req, res, next){
    var session = req.cookies.session;
    if (session == null){
        res.send({status:404, message:"Not signed in!"});
    }else{
        db.user.findOne({session: session}, function (err, docs){
            if (err){
                return res.send("Sign in error!")
            } else{
                if (user==null){
                    res.send("Not signed in!")
                }else{
                    next();
                }
            }
        })
        
    }
}

function generateGUID(){
    var authToken = guid.raw();
    return authToken
}
var exports = {
    ensureSignedIn: ensureSignedIn,
    generateGUID: generateGUID
}

module.exports = exports;

//basically export default of ReactJS
//makes component enure signed in