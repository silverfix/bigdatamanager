"use strict";

var fs = require('fs');
var jsonlint = require("jsonlint");
var async = require("async");
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/oim';
var _ = require("underscore");

var Datas = require("../model/Data");
var Normalization = require("../model/Normalization");

var iconvlite = require('iconv-lite');
var mongoose = require('mongoose');
var stream = require('stream');
var readline = require('readline');

var Schema = mongoose.Schema;
var SchemaData = require("../model/Data").SCHEMA;

/**
 *  Edit JSON parse fn
 */
JSON._parse = JSON.parse;
JSON.parse = function (data) {
    try {
        return JSON._parse(data);
    } catch (e) {
        jsonlint.parse(data);
    }
};

var Regions = function (data) {
    this.data = data;
};

Regions.SCHEMA = new mongoose.Schema({any: Schema.Types.Mixed});
Regions.MODEL_NAME = "region";

/**
 * Inserisce una nuova nazione all'interno del db
 * @param fileNames
 * @param callback - fn(err, { keyfile: {insert:{Number}, discard:{Number} }
 */
Regions.importFromFile = function (fileNames, callback) {

    var ris = {};
    var Utils = require('../controller/nodeUtil');

    MongoClient.connect(url, function (err, db) {

        var regions = db.collection('regions');

        async.each(fileNames,

            //save file
            function (file, cb) {
                console.log("CALL saveFile " + file.path);

                var path = file.path;
                var contDiscard = 0;
                var contInsert = 0;

                async.waterfall(
                    [
                        //read file
                        function (callback) {

                            console.log("CALL: read file");

                            // "utf-8",

                            fs.readFile(path,

                                function (err, data) {

                                    data = iconvlite.decode(data, "ISO-8859-1");

                                    if (err) {
                                        console.error("ERROR: fs.readFile");
                                        console.error(JSON.stringify(err));
                                        callback({status: 100, message: err.toString()});
                                    }
                                    else {
                                        callback(null, data);
                                    }
                                }
                            );
                        },

                        //saveFile
                        function (data, callback) {
                            console.log("CALL: saveFile");

                            var nationJson = jsonlint.parse(data.toString());

                            //salvo ciascuna regione del file
                            async.each(nationJson.features,

                                function (features, cb) {

                                    if( features.properties.NAME_1.indexOf('.') >= 0 )
                                    {
                                        features.properties.NAME_1 = Utils.replaceDot(features.properties.NAME_1);
                                    }

                                    regions.save(features, function (err) {
                                        if( err ){
                                            console.error(err.toString());
                                            contDiscard++;
                                        }else {
                                            contInsert++
                                        }
                                        cb(null);
                                    });
                                },

                                //end each save
                                function (err) {
                                    if (err) {
                                        console.error("ERROR EACH saveJson ");
                                        console.error("  " + JSON.stringify(err));
                                    }
                                    else
                                        console.log("END EACH saveJson");

                                    ris[file.originalname] = {success: contInsert, fail: contDiscard};

                                    fs.unlinkSync(file.path);

                                    callback(err);
                                }
                            );
                        }

                    ],

                    //end waterfall file
                    function (err) {
                        if (err) {
                            console.error("WATERFALL ERROR: saveFile");
                            console.error("  " + JSON.stringify(err));
                        }
                        else {
                            console.log("END WATERFALL");
                        }

                        cb(err);
                    }
                );
            },

            //end each file
            function (err) {
                if (err) {
                    console.error("EACH ERROR: importFromFile");
                    console.error("  " + JSON.stringify(err));
                }
                else {
                    console.log("END EACH");
                }

                db.close();
                callback(err, ris);
            }
        );

    });

};

/**
 * Restituisce solo il nome delle nazioni
 * @param callback  - fn({Err},{Data[]})
 */
Regions.getNations = function (project, callback) {

    var connection = mongoose.createConnection('mongodb://localhost/oim');
    var regions = connection.model("regions", Regions.SCHEMA);
    regions.aggregate([
        {$group:{ _id:{nation:"$properties.NAME_0",
                       region: "$properties.NAME_1"} }},
        {$group:{ _id:"$_id.nation", count:{$sum:1} }},
        {$project:{ _id:0, nation:"$_id", count:1 }},
        {$sort:{nation:1}}
    ], function(err, result){
        connection.close();
        callback(err, result);
    });
};

/**
 * Cancella la nazione specificata
 * @param region    - {String}
 * @param callback  - fn({Err},{Data[]})
 */
Regions.removeNation = function (nation, callback) {

    var Datas = require('../model/Data');

    var connection = mongoose.createConnection('mongodb://localhost/oim');
    var regionsModel = connection.model("regions", this.SCHEMA);
    var datasModel = connection.model("datas", Datas.SCHEMA);

    var ris = {
        deletedRegion: 0,
        updatedData: 0
    };

    async.waterfall(
        [
            //rimuovo le regioni della nazione selezionata
            function (next) {
                regionsModel.remove({"properties.NAME_0": nation}, function (err, result) {
                    ris.deletedRegion = result.result.n;
                    next(null);
                });
            },

            //rimuovo dai dati il riferimento delle regioni
            function (next) {

                datasModel.update(
                    {nation: nation},
                    {$unset: {nation: true, region: true}},
                    {multi: true, safe: false},
                    function (err, result) {
                        ris.updatedData = result.n;
                        next(null);
                    }
                );

            }

        ],

        function (err) {
            callback(err, ris);
        }
    );

};

/**
 * Restituisce le regioni memorizzate
 * @param isLight:{bool} - se true, restituisce solo le properties
 * @param arg_nations:[string] - nazioni da filtrare
 * @param callback
 */
Regions.getRegions = function (arg_nations, isLight, callback) {

    Datas = require("../model/Data");

    var connection = mongoose.createConnection('mongodb://localhost/oim');
    var regions = connection.model("regions", Regions.SCHEMA);
    var datas = connection.model("datas", Datas.SCHEMA);

    var queryNations = arg_nations.length > 0 ? {"properties.NAME_0": {$in: arg_nations}} : {};
    var projection = {_id:0};

    if(isLight) {
        projection["geometry"] = 0;
        projection["properties.ID_0"] = 0;
        projection["properties.ISO"] = 0;
        projection["properties.ISO2"] = 0;
    }

    regions.find(
        queryNations,
        projection,
        function (err, regions) {
            console.log("CALL: Region.getRegion - #regions %s", regions.length);
            callback(null, regions);
        }
    );
};

/**
 *
 * @param arg
 * @param arg.file
 * @param callback
 */
Regions.setNormalization = function(arg, callback){

    var contAccepted = 0;
    var contUnaccepted = 0;
    var contError = 0;
    var filePath = arg.file.path;

    var instream = fs.createReadStream(filePath);
    var outstream = new stream;
    var rl = readline.createInterface(instream, outstream);
    var docs = [];

    rl.on('line', function(line) {
        try{
            var obj = JSON.parse(line);

            if(obj.latitude && obj.longitude) {
                var loc = {
                    "type" : "Point",
                    "coordinates" : [ obj.longitude, obj.latitude ]
                };
                docs.push({loc:loc});
                contAccepted++;
            }else
                contUnaccepted++;
        }catch(e) {
            contError++;
        }
    });

    rl.on('close', function() {
        fs.unlinkSync(filePath);

        async.waterfall([

            //salvo i documenti
            function(next){
                Normalization.overwriteDocs(docs, function(err, result){
                    next(err);
                })
            },

            //aggiorno le regioni con i documenti salvati
            function(next){
                Regions.updateCountNormalization(function(err, result){
                    next(null);
                });
            }

        ], function(err){
            callback({accepted: contAccepted, unaccepted: contUnaccepted, error: contError});
        });
    });

};

/**
 * Sincronizza i il database di normalizzazione con le regioni inserite
 * @param callback
 */
Regions.updateCountNormalization = function(callback){

    //uso i driver nativi (bug mongoose)
    MongoClient.connect( url, function (err, db)
    {
        var normColl = db.collection('normalization');
        var regionsColl = db.collection('regions');

        async.waterfall([

            //prendo le regioni
            function(next){
                console.log("     FETCH nations");
                regionsColl.find( {}).toArray( function(err, regions) {
                    next(err, regions);
                });
            },

            //per ogni regione sincronizzo i dati
            function(regions, next){

                async.each(regions, function (region, next){

                    //trovo tutti i dati all'inteerno della regione
                    normColl.find({
                        loc: {$geoWithin: {$geometry: region.geometry}}
                    }).count(function(err, cont){

                        //aggiorno la regione
                        regionsColl.updateOne(
                            {_id: region._id},
                            {$set:{"properties.baseNorm": cont}},
                            function(err, res){
                                next(null);
                            }
                        );

                    });

                }, function(err){
                    next(null);
                })

            }

        ], function(err){

            db.close();
            callback(err);

        });




    });
};

module.exports = Regions;

//Regions.getRegions_bak = function (projectName, arg_nations, arg_tags, isLight, callback)

