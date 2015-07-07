"use strict";

function RegionBarCtrl() {};

RegionBarCtrl.selectedRegions = null;
RegionBarCtrl.selectedNations = null;

RegionBarCtrl.stat = null;
RegionBarCtrl.minData = null;
RegionBarCtrl.maxData = null;

RegionBarCtrl.$radioNations = null;
RegionBarCtrl.$radioRegions = null;
RegionBarCtrl.$cmbNations = null;
RegionBarCtrl.$cmbRegions = null;
RegionBarCtrl.$filterButton = null;
RegionBarCtrl.$restoreButton = null;
RegionBarCtrl.$container = null;
RegionBarCtrl.$barChart = null;
RegionBarCtrl.$sliderTimer = null;

RegionBarCtrl.$formRegions = null;
RegionBarCtrl.$formNations = null;
RegionBarCtrl.$radioByNumber = null;
RegionBarCtrl.$radioByDensity = null;

RegionBarCtrl.$NameButton = null;
RegionBarCtrl.$NumButton = null;
RegionBarCtrl.$AZbutton = null;
RegionBarCtrl.$ZAbutton = null;

RegionBarCtrl.data = null;
RegionBarCtrl.type = "Nations";


RegionBarCtrl.init = function()
{
    console.log("CALL: init");

    RegionBarCtrl.$radioByNumber = $('#radioByNumber');
    RegionBarCtrl.$radioByDensity = $('#radioByDensity');

    RegionBarCtrl.$formRegions = $('#formRegions');
    RegionBarCtrl.$formNations = $('#formNations');

    RegionBarCtrl.$radioNations = $('#radioNations');
    RegionBarCtrl.$radioRegions = $('#radioRegions');

    RegionBarCtrl.$cmbRegions = $('#cmbRegions');
    RegionBarCtrl.$cmbNations = $("#cmbNations");

    RegionBarCtrl.$container = $('#container');
    RegionBarCtrl.$barChart = $('#barChart');
    RegionBarCtrl.$sliderTimer = $("#slider-bar");

    RegionBarCtrl.$filterButton = $('#cmbFilter');
    RegionBarCtrl.$restoreButton = $('#cmbRestore');

    RegionBarCtrl.$NameButton = $('#NameButton');
    RegionBarCtrl.$NumButton = $('#NumButton');
    RegionBarCtrl.$AZbutton = $('#AZbutton');
    RegionBarCtrl.$ZAbutton = $('#ZAbutton');
};

RegionBarCtrl.initSlider = function()
{
    console.log("CALL: initSlider");

    RegionBarCtrl.$sliderTimer.dateRangeSlider(
    {
        enabled : true,
        bounds: {
            min: new Date(1950, 1, 1 ) ,
            max: new Date(2050, 1, 1 )
        } ,
        defaultValues:{
            min: new Date(1950, 1, 1 ),
            max: new Date(2050, 1, 1 )
        }
    });
};

RegionBarCtrl.setSlider = function()
{
    console.log("CALL: setSlider");

    if( RegionBarCtrl.minData != null && RegionBarCtrl.maxData != null  )
    {
        RegionBarCtrl.$sliderTimer.dateRangeSlider(
            {
                enabled : true,
                bounds:{
                    min: new Date( RegionBarCtrl.minData ),
                    max: new Date( RegionBarCtrl.maxData )
                }
            }
        );
    }
    else
        RegionBarCtrl.$sliderTimer.dateRangeSlider({
            enabled: false
        });
};

RegionBarCtrl.clickFilter = function()
{
    console.log("CALL: clickFilter");

    var $imgFilter = $("#img-filter");
    $imgFilter.removeClass("glyphicon glyphicon-filter");
    $imgFilter.addClass("fa fa-spinner fa-spin");

    RegionBarCtrl.$NameButton.removeAttr("disabled");
    RegionBarCtrl.$NumButton.removeAttr("disabled");
    RegionBarCtrl.$AZbutton.removeAttr("disabled");
    RegionBarCtrl.$ZAbutton.removeAttr("disabled");

    if(RegionBarCtrl.$radioRegions.is(':checked'))
    {
        RegionBarCtrl.type = "Regions";
        RegionBarCtrl.selectedRegions = DomUtil.getSelectedCombo(RegionBarCtrl.$cmbRegions);
        if(RegionBarCtrl.selectedRegions.length == 0)
        {
            DomUtil.selectAll(RegionBarCtrl.$cmbRegions);
            RegionBarCtrl.$cmbRegions.multiselect('refresh');
            RegionBarCtrl.selectedRegions = DomUtil.getSelectedCombo(RegionBarCtrl.$cmbRegions);
        }
        RegionBarCtrl.buildData(RegionBarCtrl.selectedRegions);
    }
    else
    {
        RegionBarCtrl.type = "Nations";
        RegionBarCtrl.selectedNations = DomUtil.getSelectedCombo(RegionBarCtrl.$cmbNations);
        if(RegionBarCtrl.selectedNations.length == 0)
        {
            DomUtil.selectAll(RegionBarCtrl.$cmbNations);
            RegionBarCtrl.$cmbNations.selectpicker('refresh');
            RegionBarCtrl.selectedNations = DomUtil.getSelectedCombo(RegionBarCtrl.$cmbNations);
        }
        RegionBarCtrl.buildData(RegionBarCtrl.selectedNations);
    }

    $imgFilter.removeClass("fa fa-spinner fa-spin");
    $imgFilter.addClass("glyphicon glyphicon-filter");

    RegionBarCtrl.$restoreButton.removeAttr("disabled");
    RegionBarCtrl.$filterButton.prop("disabled", true);
};

RegionBarCtrl.clickRestore = function()
{
    console.log("CALL: clickRestore");

    var $imgRestore = $("#img-restore");
    $imgRestore.removeClass("glyphicon glyphicon-remove");
    $imgRestore.addClass("fa fa-spinner fa-spin");

    RegionBarCtrl.$barChart.replaceWith('<div id="barChart" style="margin-top: 50px"></div>');
    RegionBarCtrl.$barChart = $('#barChart');

    DomUtil.deselectAll(RegionBarCtrl.$cmbRegions);
    RegionBarCtrl.$cmbRegions.multiselect('refresh');
    DomUtil.deselectAll(RegionBarCtrl.$cmbNations);
    RegionBarCtrl.$cmbNations.selectpicker('refresh');

    $imgRestore.removeClass("fa fa-spinner fa-spin");
    $imgRestore.addClass("glyphicon glyphicon-remove");

    RegionBarCtrl.$filterButton.removeAttr("disabled");
    RegionBarCtrl.$restoreButton.prop("disabled", true);

    RegionBarCtrl.$NameButton.prop("disabled", true);
    RegionBarCtrl.$NumButton.prop("disabled", true);
    RegionBarCtrl.$AZbutton.prop("disabled", true);
    RegionBarCtrl.$ZAbutton.prop("disabled", true);
};

/**
 *
 * @param obj
 * @returns {Array} - eg. ['obj.name', 0, "", 5, "", 0, "", 10, ""];
 */

RegionBarCtrl.buildData = function(dataSelected)
{
    console.log("CALL: buildData");

    var data = [];
    var i_r = 1;    //indice riga

    data[0] = RegionBarCtrl.getHeader();


    _.each(RegionBarCtrl.stat.data.nations, function (obj) {

        var row = null;

        if (RegionBarCtrl.type == "Nations") {
            row = obj;
            if (dataSelected.indexOf(obj.name) >= 0)
                data.push(RegionBarCtrl.createRow(row));
        }
        else {
            _.each(obj.regions, function (region) {
                if (dataSelected.indexOf(region.name) >= 0) {
                    row = region;
                    row.nation = obj.name;
                    data.push(RegionBarCtrl.createRow(row));
                }
            });

        }
    });

    RegionBarCtrl.data = data;
    RegionBarCtrl.drawBar();
};

RegionBarCtrl.createRow = function(obj)
{
    var newRow = [];
    if(obj["nation"] == null)
        newRow[0] = obj.name;
    else
        newRow[0] = obj.nation + " - " + obj.name;

    var cont = 0;
    _.each(RegionBarCtrl.stat.data.allTags, function (tag) {
        {
            var index = obj.counter.indexOfObject("tag", tag);
            if (index == -1) {
                newRow.push(0);
                newRow.push("");
            }
            else {
                newRow.push(obj.counter[index].count);
                cont += obj.counter[index].count;
                newRow.push("");
            }
        }
    });
    newRow[newRow.length-1] = cont;
    return newRow;

};

RegionBarCtrl.drawBar = function()
{
    var dataTable = google.visualization.arrayToDataTable(RegionBarCtrl.data);

    var desc = true;

    if(RegionBarCtrl.$AZbutton.hasClass("active"))
        desc = false;
    if(RegionBarCtrl.$NameButton.hasClass("active"))
        dataTable.sort([{column: 0, desc: desc}]);
    if(RegionBarCtrl.$NumButton.hasClass("active"))
        dataTable.sort([{column: RegionBarCtrl.data[0].length - 1, desc: desc}]);

    var chartAreaHeight = dataTable.getNumberOfRows() * 30;
    var chartHeight = chartAreaHeight + 80;
    var heightBar = 60;

    var options = {
        width: "100%",
        height: chartHeight, //dataTable.getNumberOfRows() * 30,
        legend: { position: 'top',  maxLines: 3, textStyle: {fontSize: 13}},
        bar:    { groupWidth: heightBar + "%" },
        annotations: {
            alwaysOutside: false,
            textStyle:  { color: "black"}
        },
        chartArea: {'height': chartAreaHeight, 'right':0},
        isStacked: true,
        backgroundColor: 'transparent',
        hAxis: { title: "Data by tags", textStyle: { fontSize: 13 }},
        vAxis: { title: RegionBarCtrl.type, textStyle: { fontSize: 13 }}
    };

    var view = new google.visualization.DataView(dataTable);
    var e = document.getElementById("barChart");
    var chart = new google.visualization.BarChart(e);
    chart.draw(view, options);
};

RegionBarCtrl.setInitialData = function()
{
    console.log("CALL: setInitialData");

    RegionBarCtrl.minData = new Date( RegionBarCtrl.stat.data.minDate );
    RegionBarCtrl.maxData = new Date( RegionBarCtrl.stat.data.maxDate );

    RegionBarCtrl.removeWait();
};

RegionBarCtrl.getData = function()
{
    console.log("CALL: getData");

    DataCtrl.getField( function(doc){
        RegionBarCtrl.stat = doc;
        RegionBarCtrl.setInitialData();
    }, DataCtrl.FIELD.STAT );
};

RegionBarCtrl.getHeader = function(type)
{
    console.log("CALL: getHeader");

    var ris = [];
    var cont = 1;

    ris[0] = RegionBarCtrl.type;
    _.each(RegionBarCtrl.stat.data.allTags, function (tag) {
        ris[cont] = tag;
        ris[cont+1] = {role: 'annotation', type: 'number'};
        //ris[cont+1] = {type: 'string', role: 'annotation', p: {html: true}};
        cont+=2;
    });

    return ris;
};

RegionBarCtrl.removeWait = function()
{
    console.log("CALL: removeWait");

    $("#spinner").addClass("hidden");
    RegionBarCtrl.$container.removeClass("hidden");

    //solo dopo che ho reso visibile lo slider posso inizializzarlo
    RegionBarCtrl.initSlider();
    RegionBarCtrl.setSlider();
    RegionBarCtrl.enableCombo();
};

RegionBarCtrl.enableCombo = function()
{
    console.log("CALL: enableCombo");

    if (RegionBarCtrl.stat.data.nations.length == 0) {
        RegionBarCtrl.$cmbNations.attr('disabled', true);
        //CompareCtrl.$cmbNations.selectpicker('refresh');
        RegionBarCtrl.$cmbRegions.multiselect('disable');
        $('#warning').removeClass('hidden');
    }
    else
    {
        RegionBarCtrl.$filterButton.attr('disabled', false);
        RegionBarCtrl.initComboNations();
        RegionBarCtrl.initComboRegions();
        RegionBarCtrl.$cmbNations.selectpicker('refresh');
        RegionBarCtrl.$cmbRegions.multiselect('refresh');
    }
};

RegionBarCtrl.initComboNations = function()
{
    console.log("CALL: initComboNations");

    _.each(RegionBarCtrl.stat.data.nations, function(obj){
        if(obj.count > 0)
            DomUtil.addOptionValue(RegionBarCtrl.$cmbNations, obj.name);
    });
};

RegionBarCtrl.initComboRegions = function()
{
    console.log("CALL: initComboRegions");

    RegionBarCtrl.$cmbRegions.multiselect();
    var optgroups = RegionBarCtrl.setComboRegionsData();
    RegionBarCtrl.$cmbRegions.multiselect( optgroups.length == 0? 'disable' : 'dataprovider', optgroups);
};

RegionBarCtrl.setComboRegionsData = function()
{
    console.log("CALL: setComboRegionsData");

    var ris = [];
    var cont = 0;
    _.each(RegionBarCtrl.stat.data.nations, function(obj){
        if(obj.count > 0) {
            var nation = {
                label: obj.name,
                children: []
            };

            _.each(obj.regions, function (region) {
                if (region.count > 0) {
                    var child = {
                        label: region.name,
                        value: cont++
                    };
                    nation.children.push(child);
                }
            });
            ris.push(nation);
        }
    });

    return ris;
};

RegionBarCtrl.handleClick = function(radio)
{
    console.log("CALL: handleClick");

    if(radio.value == "regions"){
        RegionBarCtrl.$formNations.addClass('hidden');
        RegionBarCtrl.$formRegions.removeClass('hidden');
    }
    else{
        RegionBarCtrl.$formNations.removeClass('hidden');
        RegionBarCtrl.$formRegions.addClass('hidden');
    }
    RegionBarCtrl.$filterButton.attr('disabled', false);
};

RegionBarCtrl.NameButtonClick = function()
{
    console.log("CALL: NameButtonClick");

    RegionBarCtrl.$NameButton.addClass("active");
    RegionBarCtrl.$NumButton.removeClass("active");
    RegionBarCtrl.drawBar();
};

RegionBarCtrl.NumButtonClick = function()
{
    console.log("CALL: NumButtonClick");

    RegionBarCtrl.$NumButton.addClass("active");
    RegionBarCtrl.$NameButton.removeClass("active");
    RegionBarCtrl.drawBar();
};

RegionBarCtrl.AZbuttonClick = function()
{
    console.log("CALL: AZbuttonClick");

    RegionBarCtrl.$AZbutton.addClass("active");
    RegionBarCtrl.$ZAbutton.removeClass("active");
    RegionBarCtrl.drawBar();
};

RegionBarCtrl.ZAbuttonClick = function()
{
    console.log("CALL: ZAbuttonClick");

    RegionBarCtrl.$ZAbutton.addClass("active");
    RegionBarCtrl.$AZbutton.removeClass("active");
    RegionBarCtrl.drawBar();
};


