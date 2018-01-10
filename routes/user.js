let express = require('express');
let router = express.Router();

let config = require('config');
let conf = config.get('conf');

/* GET users listing. */
router.get('/:userid?/:func?/:doit?', function(req, res, next) {

        init(req, res, next);
});

function init(req, res, next) {
    if(req.params.userid == null) {
        //list all users with links

        req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function(err, result) {
            console.log(result);
            res.render('user_list', { users: result });

        });

    } else {
        switch (req.params.func) {
            case 'create': {

                if(req.params.doit !== "true") {
                    //ask to create user
                    console.log('not doit');
                    res.send('Create user ' + req.params.userid + '?<br><a href="/user/' + req.params.userid + '/create/true">Yes!</a> | <a href="/user/">No.</a>');
                } else {
                    //create user
                    console.log(' doit');

                    let userdata = {
                        $set: {
                            name: req.params.userid
                        }
                    };

                    req.app.locals.db.collection(conf.db.c_user).updateOne({_id: req.params.userid},userdata, { upsert : true },  function(err, result) {
                        if (err) throw err;
                        console.log("document updated");
                        res.writeHead(302, {
                            'Location': '/user/' + req.params.userid
                        });
                        res.end();
                    });

                }
                break;
            }
            default: {

                req.app.locals.db.collection(conf.db.c_user).findOne( {_id: req.params.userid} , function(err, result) {
                console.log(result);
                    if (!result) {
                        res.writeHead(302, {
                            'Location': '/user/' + req.params.userid + '/create'
                        });
                        res.end();
                    } else {
                        //show all documents with the specified user
                        res.send('Alle Dokumente für Benutzer ' + result.name);
                    }
                });
                break;
            }
        }
    }
}

module.exports = router;
