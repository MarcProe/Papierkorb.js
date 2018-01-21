let inspect = require('eyes').inspector({maxLength: 20000});
let moment = require('moment');

let searchquery = {
    tags: function (req, query, plain, flags) {
        if (req.query.deltags || req.body.deltags) {
            delete req.session.tags;
        } else if (req.query.tags && req.query.tags !== '') {
            query.tags = new RegExp(req.query.tags, flags);
            plain.tags = req.query.tags;
            req.session.tags = req.query.tags;
        } else if (req.body.tags && req.body.tags !== '') {
            query.tags = new RegExp(req.body.tags, flags);
            plain.tags = req.body.tags;
            req.session.tags = req.body.tags;
        } else if (req.session.tags && req.session.tags !== '') {
            query.tags = new RegExp(req.session.tags, flags);
            plain.tags = req.session.tags;
        }
    },
    partner: function (req, query, plain, flags) {
        if (req.query.delpartner || req.body.delpartner) {
            delete req.session.partner;
        } else if (req.query.partner && req.query.partner !== '') {
            query.partner = new RegExp(req.query.partner, flags);
            plain.partner = req.query.partner;
            req.session.partner = req.query.partner;
        } else if (req.body.partner && req.body.partner !== '') {
            query.partner = new RegExp(req.body.partner, flags);
            plain.partner = req.body.partner;
            req.session.partner = req.body.partner;
        } else if (req.session.partner && req.session.partner !== '') {
            query.partner = new RegExp(req.session.partner, flags);
            plain.partner = req.session.partner;
        }
    },
    users: function (req, query, plain, flags) {
        if (req.query.delusers || req.body.delusers) {                                   //check if we don't want users
            delete req.session.users;
        } else if (req.query.users) {                                                   //if a new search is requested
            query.users = new RegExp(req.query.users, flags);                           //compile regexp rule to query
            plain.users = req.query.users;
            req.session.users = req.query.users;                                        //save plain search to session
        } else if (req.body.users) {                                                    //same for POST, comment too s
            query.users = new RegExp(req.body.users, flags);                            //compile regexp rule to query
            plain.users = req.body.users;
            req.session.users = req.body.users;                                         //save plain search to session
        } else if (req.session.users) {                                                 //no new request, session data
            query.users = new RegExp(req.session.users, flags);                         //compile regexp rule to query
            plain.users = req.session.users;
        }
    },
    docdate: function (req, query, plain) {
        if (req.query.deldocdate || req.body.deldocdate) {
            delete req.session.docdatefrom;
            delete req.session.docdateto;
        } else if (req.query.docdatefrom && req.query.docdatefrom !== '') {
            query.docdate = {};
            query.docdate.$gte = moment.utc(req.query.docdatefrom, 'DD.MM.YYYY').toISOString();
            query.docdate.$lte = moment.utc(req.query.docdateto, 'DD.MM.YYYY').toISOString();
            plain.docdatefrom = req.query.docdatefrom;
            plain.docdateto = req.query.docdateto;
            req.session.docdatefrom = req.query.docdatefrom;
            req.session.docdateto = req.query.docdateto;
        } else if (req.body.docdatefrom && req.body.docdatefrom !== '') {
            query.docdate = {};
            query.docdate.$gte = moment.utc(req.body.docdatefrom, 'DD.MM.YYYY').toISOString();
            query.docdate.$lte = moment.utc(req.body.docdateto, 'DD.MM.YYYY').toISOString();
            plain.docdatefrom = req.body.docdatefrom;
            plain.docdateto = req.body.docdateto;
            req.session.docdatefrom = req.body.docdatefrom;
            req.session.docdateto = req.body.docdateto;
        } else if (req.session.docdatefrom && req.session.docdatefrom !== '') {
            query.docdate = {};
            query.docdate.$gte = moment.utc(req.session.docdatefrom, 'DD.MM.YYYY').toISOString();
            query.docdate.$lte = moment.utc(req.session.docdateto, 'DD.MM.YYYY').toISOString();

            plain.docdatefrom = req.session.docdatefrom;
            plain.docdateto = req.session.docdateto
        }
    }
};

module.exports = searchquery;