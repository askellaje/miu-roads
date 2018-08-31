$(document).ready(function() {

  // launch map
  drawMap(startRegion);

  // launch timeline
  drawTimeLine(startDatePeriod);

  // change li active and update tables
  $('.nav').on('click', 'li', function() {
    $('.nav li.active').removeClass('active');
    $(this).addClass('active');
    ajaxRequest();
  });

  // update tables
  $('form#update-dashboard').on('change', function(event) {
    ajaxRequest();
  });
  
});

function ajaxRequest() {
  $.ajax({
    data : {
      page: document.querySelector(".active").id,
      region : $('form#update-dashboard select#regions').val()
    },
    // beforeSend: function() {
    //   $("#replicate").css("opacity", "0.5");
    //   $("#loader-replicate").show();
    // },
    type : 'POST',
    url : '/update-tables'
  })
  .done(function(data) {
    if (data.error) {
      console.log(data.error);
      // (function () { 
      //   var card = document.getElementById('response-replicate');
      //   card.innerHTML = '';
      //   card.appendChild(showSuccessAlert(data.error, 'danger', false));; 
      // })();
      // $("#loader-replicate").hide();
      // $("#replicate").css("opacity", "1");
    }
    else {
      // $("#loader-replicate").hide();
      // $("#replicate").css("opacity", "1");
      // (function () { 
      //   var card = document.getElementById('response-replicate');
      //   card.innerHTML = '';
      //   card.appendChild(showSuccessAlert(data.success, 'success', data.user));; 
      // })();
      updateTable("tbody-trans", data.trans);
      updateTable("tbody-lots", data.lots);
      drawMap(data.map);
      drawTimeLine(data.dates)
      // console.log(data.map);
      // console.log(data.lots[0]);
    }

  });

  event.preventDefault();
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
      "autoZoom": true,
      "balloonText": "[[title]]: [[value]]"
    },

    "valueLegend": {
      "right": 10,
      "minValue": "мін",
      "maxValue": "макс"
    },

    "export": {
      "enabled": true
    }

  } );
}

function drawTimeLine(data) {
  var chart = AmCharts.makeChart("timeline", {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 40,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled":true,
      "dataDateFormat": "YYYY-MM-DD",
      "valueAxes": [{
          "id": "v1",
          "axisAlpha": 0,
          "position": "left",
          "ignoreAxisWidth":true
      }],
      "graphs": [{
          "id": "g1",
          // "balloon":{
          //   "drop":true,
          //   "adjustBorderColor":false,
          //   "color":"#ffffff"
          // },
          "bullet": "round",
          "bulletBorderAlpha": 1,
          "bulletColor": "#FFFFFF",
          // "bulletSize": 5,
          "hideBulletsCount": 50,
          "lineThickness": 2,
          "title": "red line",
          "useLineColorForBulletBorder": true,
          "valueField": "value",
          "balloonText": "<span style='font-size:12px;'>[[value]]</span>"
      }],
      "chartScrollbar": {
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
          "pan": true,
          "valueLineEnabled": true,
          "valueLineBalloonEnabled": true,
          "cursorAlpha":1,
          "cursorColor":"#258cbb",
          "limitToGraph":"g1",
          "valueLineAlpha":0.2,
          "valueZoomable":true
      },
      "valueScrollbar":{
        "oppositeAxis":false,
        "offset":50,
        "scrollbarHeight":10
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

// launch region --> bad implementation; shoud be fixed
var startRegion = [{'id': 'UA-05', 'value': 1136505793.3000004}, {'id': 'UA-07', 'value': 372106951.53999996}, {'id': 'UA-09', 'value': 146348751.89000002}, {'id': 'UA-12', 'value': 395787755.13000005}, {'id': 'UA-14', 'value': 329551821.56}, {'id': 'UA-18', 'value': 143745720.38}, {'id': 'UA-21', 'value': 438360696.65}, {'id': 'UA-23', 'value': 713672986.7700002}, {'id': 'UA-26', 'value': 270768925.72}, {'id': 'UA-32', 'value': 375229296.68999964}, {'id': 'UA-35', 'value': 360157339.18}, {'id': 'UA-46', 'value': 771760202.1999999}, {'id': 'UA-48', 'value': 122544833.11999999}, {'id': 'UA-51', 'value': 161764246.30999997}, {'id': 'UA-53', 'value': 349570471.13000023}, {'id': 'UA-56', 'value': 257035384.72}, {'id': 'UA-59', 'value': 258034985.94000003}, {'id': 'UA-61', 'value': 969111905.88}, {'id': 'UA-63', 'value': 692328519.44}, {'id': 'UA-65', 'value': 211739806.05000004}, {'id': 'UA-68', 'value': 415612696.7100001}, {'id': 'UA-71', 'value': 533340356.20000005}, {'id': 'UA-74', 'value': 431828076.74000007}, {'id': 'UA-77', 'value': 222325706.43000004}]

// launch date period --> bad implementation; shoud be fixed
var startDatePeriod = [{'date': '2018-01-18', 'value': 3427161}, {'date': '2018-01-22', 'value': 620237}, {'date': '2018-01-25', 'value': 6680219}, {'date': '2018-01-29', 'value': 6006683}, {'date': '2018-02-07', 'value': 9376461}, {'date': '2018-03-15', 'value': 14909111.04}, {'date': '2018-03-16', 'value': 80584.34}, {'date': '2018-03-19', 'value': 4419049.8}, {'date': '2018-03-20', 'value': 1420395}, {'date': '2018-03-21', 'value': 12273848}, {'date': '2018-03-22', 'value': 1140}, {'date': '2018-03-27', 'value': 8543746}, {'date': '2018-03-28', 'value': 5444049.5600000005}, {'date': '2018-03-29', 'value': 9207690.26}, {'date': '2018-04-03', 'value': 29341.649999999998}, {'date': '2018-04-12', 'value': 11878000}, {'date': '2018-04-13', 'value': 36708272.2}, {'date': '2018-04-16', 'value': 11388947}, {'date': '2018-04-20', 'value': 26351026.36}, {'date': '2018-04-23', 'value': 4421320.16}, {'date': '2018-04-24', 'value': 35414999.84}, {'date': '2018-04-25', 'value': 3678151}, {'date': '2018-04-26', 'value': 21330882.38}, {'date': '2018-04-27', 'value': 68316.53}, {'date': '2018-05-03', 'value': 43110000}, {'date': '2018-05-04', 'value': 5044112.14}, {'date': '2018-05-05', 'value': 9970609.85}, {'date': '2018-05-08', 'value': 7000000}, {'date': '2018-05-11', 'value': 15497661}, {'date': '2018-05-15', 'value': 22437207.7}, {'date': '2018-05-16', 'value': 3482926.27}, {'date': '2018-05-18', 'value': 24308553.77}, {'date': '2018-05-21', 'value': 28473164}, {'date': '2018-05-22', 'value': 3927642}, {'date': '2018-05-23', 'value': 1290780.46}, {'date': '2018-05-24', 'value': 493318}, {'date': '2018-05-25', 'value': 786594.97}, {'date': '2018-05-30', 'value': 345759.06}, {'date': '2018-06-04', 'value': 54144226.64}, {'date': '2018-06-05', 'value': 6995648.5600000005}, {'date': '2018-06-06', 'value': 1036876.32}, {'date': '2018-06-07', 'value': 3384064}, {'date': '2018-06-08', 'value': 23892000}, {'date': '2018-06-12', 'value': 5484573}, {'date': '2018-06-13', 'value': 5255936}, {'date': '2018-06-15', 'value': 920501.8}, {'date': '2018-06-19', 'value': 87866032.4}, {'date': '2018-06-20', 'value': 1065894.9}, {'date': '2018-06-21', 'value': 10720233.6}, {'date': '2018-06-22', 'value': 14030820.01}, {'date': '2018-06-23', 'value': 77033.87000000001}, {'date': '2018-06-26', 'value': 39872576.3}, {'date': '2018-07-03', 'value': 26194856.33}, {'date': '2018-07-04', 'value': 40033498.03}, {'date': '2018-07-05', 'value': 65831886.379999995}, {'date': '2018-07-10', 'value': 3116027.35}, {'date': '2018-07-11', 'value': 1254947.28}, {'date': '2018-07-13', 'value': 5735125.8100000005}, {'date': '2018-07-17', 'value': 20039594.189999998}, {'date': '2018-07-19', 'value': 8204690}, {'date': '2018-07-24', 'value': 75477678.82}, {'date': '2018-07-25', 'value': 411052.4}, {'date': '2018-07-26', 'value': 19443423.97}, {'date': '2018-07-27', 'value': 59784308.91}, {'date': '2018-07-30', 'value': 3239930.58}, {'date': '2018-08-01', 'value': 11795531.59}, {'date': '2018-08-02', 'value': 2009162.81}, {'date': '2018-08-06', 'value': 10685569.91}, {'date': '2018-08-07', 'value': 43121288.39}, {'date': '2018-08-08', 'value': 17932770}, {'date': '2018-08-09', 'value': 1284047.46}, {'date': '2018-08-10', 'value': 14014185.07}, {'date': '2018-08-13', 'value': 5695608.35}, {'date': '2018-08-14', 'value': 13192736.6}, {'date': '2018-08-16', 'value': 33413494.33}]