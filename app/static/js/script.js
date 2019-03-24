$(document).ready(function() {

  // launch map
  drawMap(dataMap['ukravto'], false);

  // launch timeline and tables
  ajaxRequest('ukravto', 'UA-05', '/start', false);

  // change li active and update tables
  $('ul.nav li').click(function(event){
    var previous = $('li.active').attr('id');
    $('ul.nav li.active').removeClass('active');
    $(this).addClass('active');

    var current = $(this).attr('id');

    var val = $(this).data('value');

    changeContainer(previous, current, val);

  });

});

function ajaxRequest(page, regionId, url, evt) {
  $.ajax({
    data : {
      page: page,
      region : regionId
    },
    beforeSend: function() {
      for (let i = 1; i < 5; i++) {
        showLoader(`#card-${i}`, `#loader-${i}`);
      }
    },
    type : 'POST',
    url : url
  })
  .done(function(data) {
    if (data.error) {
      console.log(data.error);
      for (let i = 1; i < 5; i++) {
        hideLoader(`#card-${i}`, `#loader-${i}`);
      }
    }
    else {
      for (let i = 1; i < 5; i++) {
        hideLoader(`#card-${i}`, `#loader-${i}`);
      }
      updateTable("tbody-trans", data.trans);
      updateTable("tbody-lots", data.lots);
      drawTimeLine(data.dates[0], data.region, 0);

      updateInfoBox(data.region, data.budget, data.ratio, data.spent, data.n_trans, data.n_lots);

      $('#change-timeline').change(function(){
        var val = $('input[name=dataset]:checked', '#change-timeline').val();
        drawTimeLine(data.dates[val], data.region, parseInt(val));
      });
    }
  });
  if (evt) {
    event.preventDefault();
  }
}

function updateInfoBox(title, budget, ratio, spent, trans, lots) {
  document.getElementById('map-info-title').innerHTML = `${title} область`;
  document.getElementById('map-info-budget').innerHTML = budget;
  document.getElementById('map-info-ratio').innerHTML = ratio;
  document.getElementById('map-info-spent').innerHTML = spent;
  document.getElementById('map-info-trans').innerHTML = trans;
  document.getElementById('map-info-lots').innerHTML = lots;
}

function ajaxRequestPorog() {
  $.ajax({
    data : {
      // do nothing
    },
    beforeSend: function() {
      showLoader(`#card-4`, `#loader-4`);
    },
    type : 'POST',
    url : '/porog'
  })
  .done(function(data) {
    if (data.error) {
      console.log(data.error);
      hideLoader(`#card-4`, `#loader-4`);
    }
    else {

      initDataTable(data.lots[0]);
      $('#porog-form').change(function(){
        var val = $('input[name=dataset-porog]:checked', '#porog-form').val();
        $('#data-table').empty();
        recreatePorogTable();
        initDataTable(data.lots[val]);

      });

      hideLoader(`#card-4`, `#loader-4`);
    }
  });
  event.preventDefault();
}

function ajaxRequestCalculator() {
  $.ajax({
    data : {
      petrol_2018: $("#form-calculator #petrol_2018").val(),
      diesel_2018: $("#form-calculator #diesel_2018").val(),
      gas_2018: $("#form-calculator #gas_2018").val(),
      alt_fuel_2018: $("#form-calculator #alt_fuel_2018").val(),
      petrol_2019: $("#form-calculator #petrol_2019").val(),
      diesel_2019: $("#form-calculator #diesel_2019").val(),
      gas_2019: $("#form-calculator #gas_2019").val(),
      alt_fuel_2019: $("#form-calculator #alt_fuel_2019").val()
    },
    beforeSend: function() {
      showLoader(`#card-5`, `#loader-5`);
    },
    type : 'POST',
    url : '/calculator'
  })
  .done(function(data) {
    if (data.error) {
      console.log(data.error);
      hideLoader(`#card-5`, `#loader-5`);
    }
    else {
      document.getElementById('calculator-2018-eur').innerHTML = `${data.roads_total_2018_eur} євро`;
      document.getElementById('calculator-2019-eur').innerHTML = `${data.roads_total_2019_eur} євро`;
      document.getElementById('calculator-2018-uah').innerHTML = `${data.roads_total_2018_uah} грн`;
      document.getElementById('calculator-2019-uah').innerHTML = `${data.roads_total_2019_uah} грн`;
      document.getElementById('roads_country_60_2018').innerHTML = `${data.roads_country_60_2018} грн`;
      document.getElementById('roads_country_60_2019').innerHTML = `${data.roads_country_60_2019} грн`;
      document.getElementById('roads_country_35_2018').innerHTML = `${data.roads_country_35_2018} грн`;
      document.getElementById('roads_country_35_2019').innerHTML = `${data.roads_country_35_2019} грн`;
      document.getElementById('roads_safety_2018').innerHTML = `${data.roads_safety_2018} грн`;
      document.getElementById('roads_safety_2019').innerHTML = `${data.roads_safety_2019} грн`;

      createRegionTbody('region-tbody-2018', data.regions_2018);
      createRegionTbody('region-tbody-2019', data.regions_2019);

      hideLoader(`#card-5`, `#loader-5`);
    }
  });
  event.preventDefault();
}

function recreatePorogTable() {
  txt = `
    <table class="table tablesorter" id="table-porog-0">
      <thead class="text-info">
        <tr>
          <th>Лот</th>
          <th>Очікувана вартість</th>
          <th>Організатор</th>
          <th>Переможець</th>
          <th>Сума переможної пропозиції</th>
          <th>Регіон</th>
        </tr>
      </thead>
      <tbody id="tbody-porog"></tbody>
    </table>
  `
  var wrapper = document.getElementById('data-table');
  wrapper.innerHTML = txt;

}

function initDataTable(lots) {
  updateTable("tbody-porog", lots);
  $("#table-porog-0").DataTable({
    "language": {
      "search": "Пошук по всіх колонках",
      "lengthMenu": "Кількість рядків _MENU_",
      "paginate": {
        "previous": `<i class="tim-icons icon-minimal-left"></i>`,
        "next": `<i class="tim-icons icon-minimal-right"></i>`
      }
    },
    "bInfo" : false,
    "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>'
  });
  var inp = $('#table-porog-0_filter input').addClass('form-control');
  inp.attr("placeholder", "Автомагістраль");

  var select = $('#table-porog-0_length select').addClass('form-control');

  $('div.row.view-pager div.col-sm-12').addClass('d-flex justify-content-center');

}

function drawMap(data, page) {
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
      "color": "#a4d1fc",
      "colorSolid": "#1770c6",
      "balloonText": `<div class='wrapper-tooltip-title'><span class='map-tooltip-title'>[[title]]</span></div><div class='wrapper-tooltip-value'><span class='map-tooltip-value'>[[value]] грн.</span></div>`
    },
    "baloon": {
      "verticalPadding": 10,
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
    // "listeners": [{
    //   "event": "init",
    //   "method": function(e) {
    //     preSelectRegion("UA-05");
    //   }
    // }]
  });

  map.addListener("clickMapObject", function(event) {
    // for (var i in map.dataProvider.areas) {
    //   var area = map.dataProvider.areas[i];
    //   if (area.showAsSelected) {
    //     //set a new color only if it wasn't assigned before
    //     area.showAsSelected = false;
    //   }
    // }
    // event.mapObject.showAsSelected = true;
    // map.validateNow();

    // checked "by month" radio
    checkRadioButtonDefault();

    // update timeline and tables
    ajaxRequest(document.querySelector(".active").id, event.mapObject.id, '/update', true);

    changeLinkBigTable(event.mapObject.id, "big-table-lots");
    changeLinkBigTable(event.mapObject.id, "big-table-trans");
  });

  /**
   * Function which extracts currently selected country list.
   * Returns array consisting of country ISO2 codes
   */
  // function preSelectRegion(area) {
  //   var area = map.getObjectById(area);
  //   area.showAsSelected = true;
  //   map.returnInitialColor(area);
  // }

}

function drawTimeLine(data, regionSubtitle, budget) {
  var chart = AmCharts.makeChart("timeline", {
      "type": "serial",
      "theme": "light",
      "titles": [{
        "text": "Динаміка платежів",
        "size": 16
      }, {
        "text": `${regionSubtitle} область`,
        "size": 14,
        "bold": false
      }],
      "legend": {
        "enabled": budget ? true : false,
        "equalWidths": false,
        "maxColumns": 2,
        "position": "absolute",
        "valueAlign": "center",
        "valueWidth": 100,
        "bottom": -20,
        "left": 0,
        "data": [{
          "title": "Кумулятивно",
          "color": "#1d8cf8"
          }, {
          "title": "Бюджет",
          "color": "#00bf9a"
        }]
      },
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
          //"type": "smoothedLine",
          "valueField": "value",
          "fillAlphas": 0.4,
          "lineThickness": 2,
          "lineColor": "#1d8cf8",
          "bullet": "round",
          "bulletBorderAlpha": 1,
          "bulletColor": "#FFFFFF",
          "bulletSize": 3,
          "hideBulletsCount": 50,
          "useLineColorForBulletBorder": true,
          "balloonText":`<span style='font-size:12px;'>[[value]]</span>`
        }, {
          "id": "g2",
          //"type": "smoothedLine",
          "valueField": budget ? "budget" : null,
          "lineThickness": 2,
          "lineColor": "#00bf9a",
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
      "dataProvider": data,
      "fontFamily": "Roboto"
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
      txt += `<tr><td>${obj[x].payer_name}</td><td>${obj[x].amount}</td><td>${obj[x].recipt_name}</td><td>${obj[x].doc_date}</td></tr>`
    }
  } else if (tbody === 'tbody-lots') {
    for (x in obj) {
      txt += `<tr><td><a href="${obj[x].link}" target="_blank">${obj[x].lot.slice(0,19)}</td><td>${obj[x].organizer.slice(0,19)}</td><td>${obj[x].expected_cost}</td><td>${obj[x].winner.slice(0,19)}</td><td>${obj[x].sum_win}</td></tr>`
    }
  } else {
    for (x in obj) {
      txt += `<tr><td><a href="${obj[x].link}" target="_blank">${obj[x].lot.slice(0,50)}</td><td>${obj[x].expected_cost}</td><td>${obj[x].organizer.slice(0,50)}</td><td>${obj[x].winner.slice(0,19)}</td><td>${obj[x].sum_win}</td><td>${obj[x].region_name}</td></tr>`
    }
  }

  table.innerHTML = txt;

  return table
}

function checkRadioButtonDefault() {
  $('input[name=dataset]', '#change-timeline')[0].checked = true;
}

function changeContainer(prev, current, val) {
  var arr_maps = ['ukravto', 'subvention', 'safety', 'experiment', 'other']
  var arr_not_maps = ['porog', 'calculator']

  if ((prev != current) && (arr_maps.includes(prev)) && (arr_maps.includes(current))) { // map -> map
    drawMap(dataMap[val], 1);

    ajaxRequest(document.querySelector(".active").id, 'UA-05', '/update', true);

    checkRadioButtonDefault();

    changeLinkBigTable('UA-05', 'big-table-lots');
    changeLinkBigTable('UA-05', 'big-table-trans');

  } else if (current == 'porog') { // * -> porog
    clearContainer();

    createTable();

  } else if ((arr_not_maps.includes(prev)) && (arr_maps.includes(current))) { // porog|calculator -> map
    clearContainer();

    createContainer();

    drawMap(dataMap[val], parseInt(val));

    ajaxRequest(document.querySelector(".active").id, 'UA-05', '/update', true);

    checkRadioButtonDefault();
  } else if (current == 'calculator') { // * -> calculator
    clearContainer();

    createCalculator();

    accordion();

    createRegionTbody('region-tbody-2018');
    createRegionTbody('region-tbody-2019');

  } else {
    return // do nothing
  }
}

function clearContainer() {
  var container = document.getElementById('dashboard-container');
  container.innerHTML = '';
}

function createCalculator() {
    document.getElementById('dashboard-container').innerHTML = `
    <div class="row">
        <div class="col-12">
            <div class="card" id="card-5">
                <div class="card-header">
                    <h4 class="card-title" style="font-weight: bold;">Калькулятор</h4>
                    <h6>Куди витратили Ваші кошти?</h6>
                </div>
                <div class="card-body">
                    <form id="form-calculator">
                        <div class='row'>
                            <div class='col-12'>
                                <h4>Кількість літрів пального які ви придбали, л.</h4>
                            </div>
                            <div class="col-6" style='border-right: 1px solid lightgrey;'>
                                <h5>2018 рік</h5>
                                <div class="form-group">
                                    <label for="petrol_2018">Бензин</label>
                                    <input type="number" class="form-control" min="0" id="petrol_2018" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="diesel_2018">Дизель</label>
                                    <input type="number" class="form-control" min="0" id="diesel_2018" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="gas_2018">Газ</label>
                                    <input type="number" class="form-control" min="0" id="gas_2018" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="alt_fuel_2018">Альтернативне паливо</label>
                                    <input type="number" class="form-control" min="0" id="alt_fuel_2018" value="0">
                                </div>
                            </div>
                            <div class="col-6">
                                <h5>2019 рік</h5>
                                <div class="form-group">
                                    <label for="petrol_2019">Бензин</label>
                                    <input type="number" class="form-control" min="0" id="petrol_2019" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="diesel_2019">Дизель</label>
                                    <input type="number" class="form-control" min="0" id="diesel_2019" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="gas_2019">Газ</label>
                                    <input type="number" class="form-control" min="0" id="gas_2019" value="0">
                                </div>
                                <div class="form-group">
                                    <label for="alt_fuel_2019">Альтернативне паливо</label>
                                    <input type="number" class="form-control" min="0" id="alt_fuel_2019" value="0">
                                </div>
                            </div>
                        </div>
                        <button id="submit" type="submit" class="btn btn-info">Розрахувати</button>
                    </form>
                    <hr>
                    <div class='row'>
                        <div class='col-12'>
                            <h4>Всього пішло на дороги</h4>
                        </div>
                        <div class='col-6' style='border-right: 1px solid lightgrey;'>
                            <div class='col-12 form-group'>
                                <span id="calculator-2018-eur" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 євро</span>
                            </div>
                            <div class='col-12 form-group'>
                                <span id="calculator-2018-uah" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                        <div class='col-6'>
                            <div class='col-12 form-group'>
                                <span id="calculator-2019-eur" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 євро</span>
                            </div>
                            <div class='col-12 form-group'>
                                <span id="calculator-2019-uah" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class='row'>
                        <div class='col-12'>
                            <h4>Дороги державного значення, 60%</h4>
                        </div>
                        <div class='col-6' style='border-right: 1px solid lightgrey;'>
                            <div class='col-12 form-group'>
                                <span id="roads_country_60_2018" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                        <div class='col-6'>
                            <div class='col-12 form-group'>
                                <span id="roads_country_60_2019" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class='row'>
                        <div class='col-12'>
                            <h4>Дороги місцевого значення, 35%</h4>
                        </div>
                        <div class='col-6' style='border-right: 1px solid lightgrey;'>
                            <div class='col-12 form-group'>
                                <span id="roads_country_35_2018" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                            <div class='col-12 form-group'>
                                <button class="accordion">Розподіл за областями</button>
                                <div class="panel-accordion">
                                    <table class="table">
                                        <tbody id="region-tbody-2018"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class='col-6'>
                            <div class='col-12 form-group'>
                                <span id="roads_country_35_2019" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                            <div class='col-12 form-group'>
                                <button class="accordion">Розподіл за областями</button>
                                <div class="panel-accordion">
                                    <table class="table">
                                        <tbody id="region-tbody-2019"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class='row'>
                        <div class='col-12'>
                            <h4>Безпека руху, 5%</h4>
                        </div>
                        <div class='col-6' style='border-right: 1px solid lightgrey;'>
                            <div class='col-12 form-group'>
                                <span id="roads_safety_2018" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                        <div class='col-6'>
                            <div class='col-12 form-group'>
                                <span id="roads_safety_2019" class="form-control" style='background-color: rgba(29,37,59,.05)'>0 грн</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div id="loader-5" class="loader-wrapper">
                <div class="loader replicate"></div>
            </div>
        </div>
    </div>
    `;

    $("#submit").click(function() {
        ajaxRequestCalculator()
    });
}

function changeLinkBigTable(regionId, button) {
  var link = document.getElementById(button);
  if (button == 'big-table-lots') {
    link.setAttribute('href', `lots/${regionId}`);
  } else {
    var page = $('ul.nav li.active')[0].id;
    link.setAttribute('href', `transactions/${regionId}/${page}`);
  }
}

function createTable() {
  document.getElementById('dashboard-container').innerHTML = `
    <div class="row">
      <div class="col-12">
        <div class="card" id="card-4">
          <div class="card-header">
            <h4 class="card-title" style="font-weight: bold;">Всього лотів за областями</h4>
            <form id="porog-form">
              <div class="form-check form-check-radio form-check-inline">
                <label class="form-check-label">
                  <input class="form-check-input" type="radio" name="dataset-porog" id="porogy" value="0" checked> Пороги
                  <span class="form-check-sign"></span>
                </label>
              </div>
              <div class="form-check form-check-radio form-check-inline">
                <label class="form-check-label">
                  <input class="form-check-input" type="radio" name="dataset-porog" id="nadporogy" value="1"> Надпороги
                  <span class="form-check-sign"></span>
                </label>
              </div>
            </form>
          </div>
          <div class="card-body" id="data-table">
            <table class="table tablesorter" id="table-porog-0">
              <thead class="text-info">
                <tr>
                  <th>Лот</th>
                  <th>Очікувана вартість</th>
                  <th>Організатор</th>
                  <th>Переможець</th>
                  <th>Сума переможної пропозиції</th>
                  <th>Регіон</th>
                </tr>
              </thead>
              <tbody id="tbody-porog"></tbody>
            </table>
          </div>
        </div>
        <div id="loader-4" class="loader-wrapper">
          <div class="loader replicate"></div>
        </div>
      </div>
    </div>
  `;

  ajaxRequestPorog();

}

function createContainer() {
var row = `<div class="row">
  <div class="col-lg-6 col-md-12">
    <div class="card">
      <div class="card-header" style="text-align: center;">
        <span class="map-title">Обсяг платежів за областями</span>
        <span class="map-subtitle">Всього витрачено у гривнях</span>
      </div>
      <div class="card-wrapper">
        <div id="map"></div>
        <div id="map-info">
          <div class="map-info-header">
            <span id="map-info-title">Вінницька область</span>
          </div>
          <div class="map-info-table" id="card-4">
            <table>
              <tbody>
                <tr class="map-info-row">
                  <td>Бюджет, грн.</td>
                  <td id="map-info-budget" class="map-info-value"></td>
                </tr>
                <tr class="map-info-row">
                  <td>Витрачено, грн.</td>
                  <td id="map-info-spent" class="map-info-value"></td>
                </tr>
                <tr class="map-info-row">
                  <td>Відношення, %</td>
                  <td id="map-info-ratio" class="map-info-value"></td>
                </tr>
                <tr class="map-info-row">
                  <td>Кількість платежів</td>
                  <td id="map-info-trans" class="map-info-value"></td>
                </tr>
                <tr class="map-info-row">
                  <td>Кількість тендерів</td>
                  <td id="map-info-lots" class="map-info-value"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="loader-4" class="loader-wrapper">
            <div class="loader replicate"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-6 col-md-12">
    <div class="card" id="card-1">
      <div class="card-wrapper">
        <div id="timeline"></div>
      </div>
      <div class="card-body" style="text-align: center;">
        <form id="change-timeline">
          <div class="form-check form-check-radio form-check-inline">
            <label class="form-check-label">
              <input class="form-check-input" type="radio" name="dataset" id="by-month" value="0" checked> По місяцях
              <span class="form-check-sign"></span>
            </label>
          </div>
          <div class="form-check form-check-radio form-check-inline">
            <label class="form-check-label">
              <input class="form-check-input" type="radio" name="dataset" id="cimilative" value="1"> Кумулятивно
              <span class="form-check-sign"></span>
            </label>
          </div>
        </form>
      </div>
    </div>
    <div id="loader-1" class="loader-wrapper">
      <div class="loader replicate"></div>
    </div>
  </div>
</div>
<!-- Tables -->
<div class="row">
  <!-- Lots -->
  <div class="col-lg-6 col-md-12">
    <div class="card card-tasks" id="card-2">
      <div class="card-wrapper">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title" style="margin:0; font-weight: bold;">Список тендерів</h4>
            <a href="lots/UA-05" target="_blank" id="big-table-lots">
              <button class="btn btn-sm btn-info btn-fab btn-icon btn-round">
                <i class="tim-icons icon-bullet-list-67"></i>
              </button>
            </a>
          </div>
        </div>
        <div class="card-body">
          <div class="table-full-width table-responsive" style="max-height: 400px;">
            <table class="table tablesorter ">
              <thead class="text-info">
                <tr>
                  <th>Лот</th>
                  <th>Організатор</th>
                  <th>Очікувана вартість</th>
                  <th>Переможець</th>
                  <th>Переможна пропозиція</th>
                </tr>
              </thead>
              <tbody id="tbody-lots"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div id="loader-2" class="loader-wrapper">
      <div class="loader replicate"></div>
    </div>
  </div>
  <!-- Transactions -->
  <div class="col-lg-6 col-md-12">
    <div class="card card-tasks" id="card-3">
      <div class="card-wrapper">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title" style="margin: 0; font-weight: bold;">Фактичні платежі</h4>
            <a href="transactions/UA-05/ukravto" target="_blank" id="big-table-trans">
              <button class="btn btn-sm btn-info btn-fab btn-icon btn-round">
                <i class="tim-icons icon-bullet-list-67"></i>
              </button>
            </a>
          </div>
        </div>
        <div class="card-body">
          <div class="table-full-width table-responsive" style="max-height: 400px;">
            <table class="table tablesorter ">
              <thead class="text-info">
                <tr>
                  <th>Платник</th>
                  <th>Вартість</th>
                  <th>Отримувач</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody id="tbody-trans"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div id="loader-3" class="loader-wrapper">
      <div class="loader replicate"></div>
    </div>
  </div>
</div>`

document.getElementById('dashboard-container').innerHTML = row;

}

function showLoader(container, loader) {
  $(container).css("opacity", "0.25");
  $(loader).show();
}

function hideLoader(container, loader) {
  $(loader).hide();
  $(container).css("opacity", "1");
}

function createRegionTbody(tbody, data=null) {
    var regions = ['Вінницька', 'Волинська', 'Дніпропетровська', 'Донецька', 'Житомирська', 'Закарпатська', 'Запорізька', 'Івано-Франківська', 'Київ', 'Кіровоградська', 'Луганська', 'Львівська', 'Миколаївська', 'Одеська', 'Полтавська', 'Рівненська', 'Сумська', 'Тернопільська', 'Харківська', 'Херсонська', 'Хмельницька', 'Черкаська', 'Чернівецька', 'Чернігівська'];
    var table = document.getElementById(tbody);
    var txt = '';
    var i;

    for (i = 0; i < regions.length; i++) {
        j =  data ? data[i] : 0
        txt += `<tr><td>${regions[i]}</td><td class="text-right">${j}</td></tr>`
    }

    table.innerHTML = txt;

    return table
}

function accordion() {
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active-accordion");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight){
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
}
