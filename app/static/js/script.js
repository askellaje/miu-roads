$(document).ready(function() {

  // launch map
  drawMap(dataMap['map']);

  // launch timeline
  drawTimeLine(dataTimeLine['dates'][0]);
  $('#change-timeline').change(function(){
    var val = $('input[name=dataset]:checked', '#change-timeline').val();
    drawTimeLine(dataTimeLine['dates'][val]);
  });

  // change li active and update tables
  $('.nav').on('click', 'li', function() {
    $('.nav li.active').removeClass('active');
    $(this).addClass('active');
  });
  
});

function ajaxRequest(regionId) {
  $.ajax({
    data : {
      page: document.querySelector(".active").id,
      region : regionId
    },
    type : 'POST',
    url : '/update'
  })
  .done(function(data) {
    if (data.error) {
      console.log(data.error);
    }
    else {
      updateTable("tbody-trans", data.trans);
      updateTable("tbody-lots", data.lots);
      drawTimeLine(data.dates[0]);
      $('#change-timeline').change(function(){
        var val = $('input[name=dataset]:checked', '#change-timeline').val();
        drawTimeLine(data.dates[val]);
      });
    }
  });
  event.preventDefault();
}

function drawMap(data) {
  var map = AmCharts.makeChart( "map", {
    "type": "map",
    "theme": "light",
    "colorSteps": 10,
    "dataProvider": {
      "map": "ukraineLow",
      "areas": data
    },
    "areasSettings": {
      "autoZoom": false,
      "selectable": true,
      "balloonText": "[[title]]: [[value]]"
    },
    "valueLegend": {
      "right": 10,
      "minValue": "мін",
      "maxValue": "макс"
    },
    "export": {
      "enabled": true
    },
    /**
     * Add init event to perform country selection
     */
    "listeners": [{
      "event": "init",
      "method": function(e) {
        preSelectRegion("UA-05");
      }
    }]
  });

  map.addListener("clickMapObject", function(event) {
    for (var i in map.dataProvider.areas) {
      var area = map.dataProvider.areas[i];
      if (area.showAsSelected) {  
        //set a new color only if it wasn't assigned before
        area.showAsSelected = false; 
      }
    }
    event.mapObject.showAsSelected = true;
    map.validateNow();

    $('input[name=dataset]', '#change-timeline')[0].checked = true;
    
    ajaxRequest(event.mapObject.id);
    
    document.getElementById("map-info").innerHTML = event.mapObject.title;
  });

  /**
   * Function which extracts currently selected country list.
   * Returns array consisting of country ISO2 codes
   */
  function preSelectRegion(area) {
    var area = map.getObjectById(area);
    area.showAsSelected = true;
    map.returnInitialColor(area);
  }

}

function drawTimeLine(data) {
  var chart = AmCharts.makeChart("timeline", {
      "type": "serial",
      "theme": "light",
      "language": "uk",
      "marginRight": 40,
      "marginLeft": 100,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled":true,
      "dataDateFormat": "YYYY-MM",
      "valueAxes": [{
          "id": "v1",
          "axisAlpha": 0,
          "position": "left",
          "ignoreAxisWidth":true
      }],
      "graphs": [
        {
          "id": "g1",
          "type": "smoothedLine",
          "valueField": "value",
          "lineThickness": 2,
          "balloonText":`<span style='font-size:12px;'>[[value]]</span>`
        }
      ],
      "chartScrollbar": {
          "enabled": false,
          "graph": "g1",
          "oppositeAxis":false,
          "offset":30,
          "scrollbarHeight": 40,
          "backgroundAlpha": 0,
          "selectedBackgroundAlpha": 0.1,
          "selectedBackgroundColor": "#888888",
          "graphFillAlpha": 0,
          "graphLineAlpha": 0.5,
          "selectedGraphFillAlpha": 0,
          "selectedGraphLineAlpha": 1,
          "autoGridCount":true,
          "color":"#AAAAAA"
      },
      "chartCursor": {
          "categoryBalloonDateFormat": "YYYY MMM",
          "cursorAlpha": 0
      },
      "categoryField": "date",
      "categoryAxis": {
          "parseDates": true,
          "dashLength": 1,
          "minorGridEnabled": true
      },
      "export": {
          "enabled": true
      },
      "dataProvider": data
  });

  chart.addListener("rendered", zoomChart);

  zoomChart();

  function zoomChart() {
    chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
  }

}

function updateTable(tbody, obj) {
  var table = document.getElementById(tbody);
  table.innerHTML = '';
  
  txt = '';
  
  if (tbody === 'tbody-trans') {
    for (x in obj) {
      txt += `<tr><td>${obj[x].id}</td><td>${obj[x].amount}</td><td>${obj[x].doc_date}</td><td>${obj[x].payer_name}</td><td>${obj[x].recipt_name}</td><td>${obj[x].payment_details}</td><td>${obj[x].kevk}</td><td>${obj[x].id_region}</td></tr>`
    }
  } else {
    for (x in obj) {
      txt += `<tr><td>${obj[x].id}</td><td>${obj[x].lot}</td><td>${obj[x].expected_cost}</td><td>${obj[x].link}</td><td>${obj[x].organizer}</td><td>${obj[x].winner}</td><td>${obj[x].sum_win}</td><td>${obj[x].cpv}</td><td>${obj[x].porog}</td><td>${obj[x].id_region}</td></tr>`
    }
  }

  table.innerHTML = txt;

  return table
}