$(document).ready(function() {
  /**
   * Set data for the chart
   * @param {String} entityId  Data to get entityId for
   */
  function setData(entityId) {
    $.getJSON('/applications/buttonwood/metrics.json', {
        entityId: entityId
      }, function(data) {
        getChart().highcharts().series[0].setData(data.data, true);
      });
  }

  /**
   * Get highchart
   * @return {Object}  jQuery element of chart
   */
  function getChart() {
    if (typeof chart === 'undefined') {
      chart = $('.application-metrics-chart').highcharts('StockChart', {
        chart: {
          zoomType: 'x'
        },
        credits: {
          enabled: false
        },
        colors: ['#000000'],
        rangeSelector: {
          buttonTheme: {
            width: 60
          },
          buttons: [{
            type: 'day',
            count: 3,
            text: 'hour',
            dataGrouping: {
              approximation: 'sum',
              forced: true,
              units: [['hour', [1]]]
            }
          }, {
            type: 'month',
            count: 3,
            text: 'day',
            dataGrouping: {
              approximation: 'sum',
              forced: true,
              units: [['day', [1]]]
            }
          }, {
            type: 'year',
            count: 1,
            text: 'week',
            dataGrouping: {
              approximation: 'sum',
              forced: true,
              units: [['week', [1]]]
            }
          }, {
            type: 'all',
            text: 'month',
            dataGrouping: {
              approximation: 'sum',
              forced: true,
              units: [['month', [1]]]
            }
          }],
          selected: 0
        },
        yAxis: {
          title: {
            text: 'activity'
          }
        },
        xAxis: {
          endOnTick: true,
          labels: {
            step: 24
          },
          ordinal: false,
          startOnTick: true,
          startOfWeek: 0,
          tickInterval: 3600 * 1000
        },
        navigator: {
          enabled: false
        },
        plotOptions: {
          area: {
            lineWidth: 2
          }
        },
        scrollbar: {
          enabled: false
        },
        series: [{
          dataGrouping: {
            approximation: 'sum',
            forced: true,
            units: [
              ['hour',[1]],
              ['day',[1]],
              ['week',[1]],
              ['month',[1]],
              ['year',[1]]
            ]
          },
          name: 'interactions',
          type: 'area'
        }]
      });
    }
    return chart;
  }

  var chart;

  $('.application-metrics-controls-entity').change(function(evt) {
    setData(evt.target.value);
  });

  // render chart
  getChart();
  setData();
});
