"use strict";

var ConstantsRouter = require('./constants_router');
var Project = require("../model/Project");
var Data = require("../model/Data");
var async = require('async');
//var requestJson = require('request-json');
//var urlencode = require('urlencode');

module.exports = function (router) {

    /**
     * Mostra la schermata di login
     */
    router.get('/login', function (req, res)
    {
        //var message = { error:false, message: '' };
        res.render('../views/pages/login.ejs', ConstantsRouter.argIndex(req) );
    });

    /**
     * Mostra la schermata per la ragistrazione dell'utente
     */
    router.get('/register', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req);
        res.render('../views/pages/register.ejs', arg);
    });

    router.get('/*', function (req, res, next)
    {
        if( !req.session.user &&  !req.session.isGuest )
        {
            res.redirect("/view/login");
        }
        else
            next(null);

    });

    /**
     * Mostra il principale e unico contenitore grafico dell'applicazione
     * Tutte le diverse schermate sarranno contenute all'interno della view di angular
     */
    router.get('/app', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.HOME);
        res.render('../views/pages/app.ejs', arg );
    });

    //HOME
    router.get('/profile', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.PROFILE);
        res.render('../views/pages/index.ejs', arg );
    });

    router.get('/home', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.HOME);
        res.render('../views/partials/home.ejs', arg );
    });

    /// DB
    router.get('/db/*', function (req, res, next) {

        if(req.session.level > 0)
            next(null);
        else{
            res.redirect("/view/login");
        }
    });

    router.get('/db/nations', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.DB_NATIONS);
        res.render('../views/partials/db-nations.ejs', arg);
    });

    router.get('/db/users', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.DB_USERS);
        res.render('../views/partials/db-users.ejs', arg);
    });

    router.get('/db/normalization', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.DB_NORMALIZATION);
        res.render('../views/partials/db-normalization.ejs', arg);
    });

    ///PROJECT
    router.get('/project/newproject', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.NEW_PROJECT);
        res.render('../views/partials/prj-new.ejs', arg );
    });

    router.get('/project/editproject', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.EDIT_PROJECT);
        res.render('../views/partials/prj-edit.ejs', arg );
    });

    router.get('/project/openproject', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.OPEN_PROJECT);
        res.render('../views/partials/prj-open.ejs', arg );
    });

    ///STAT
    router.get('/stat/showdata', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.STAT_DATA);
        res.render('../views/partials/stat-showdata.ejs', arg );
    });

    router.get('/stat/showmap', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.STAT_MAP);
        res.render('../views/partials/stat-map.ejs', arg );
    });

    router.get('/stat/compare', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.STAT_COMPARE);
        res.render('../views/partials/stat-compare.ejs', arg );
    });

    router.get('/stat/timeline', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req,ConstantsRouter.PAGE.STAT_TIMELINE);
        res.render('../views/partials/stat-timeline.ejs', arg );
    });

    router.get('/stat/showtag', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.STAT_TAG);
        res.render('../views/partials/stat-tags.ejs', arg );
    });

    router.get('/stat/showusers', function (req, res)
    {
        var arg = ConstantsRouter.argIndex(req, ConstantsRouter.PAGE.STAT_USER);
        res.render('../views/partials/stat-users.ejs', arg );
    });

    router.get('/terminal', function (req, res)
    {
        res.render('../views/pages/terminal.ejs');
    });

};
