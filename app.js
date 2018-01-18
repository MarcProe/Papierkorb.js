let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');

let index = require('./routes/index');
let docs = require('./routes/docs');
let doc = require('./routes/doc');
let newdoc = require('./routes/newdoc');
let remove = require('./routes/remove');

let mongo = require('mongodb').MongoClient;
let config = require('config');

let conf = config.get('conf');

let app = express();

app.locals.moment = require('moment');

let url = conf.db.constring + conf.db.db;

console.log('Storage config:');
console.log(conf.doc);

mongo.connect(url, function(err, db) {

    if (err) throw err;

    console.log('Database connected. (' + conf.db.constring + ')');
    let dbase = db.db(conf.db.db);

    app.locals.db = dbase;

    createcol(dbase, conf.db.c_user);
    createcol(dbase, conf.db.c_doc);
    createcol(dbase, conf.db.c_tag);
    createcol(dbase, conf.db.c_partner);

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret:'fgdg345DFG4324ftr$§fqa3f43fq$Q§',
    resave: true,
    saveUninitialized: true
}));

app.use('/', index);
app.use('/doc/', docs);
app.use('/doc', doc);
app.use('/new', newdoc);
app.use('/remove', remove);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function createcol(db, name) {
    db.createCollection(name, function(err, res) {
        if (err) throw err;
        console.log('Collection ' + name + ' created.');
    });
}
module.exports = app;

