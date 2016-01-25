$(document).ready(function() {
  $.getJSON('/applications/buttonwood/metrics.json', function(data) {
    // Create the chart
    $('.application-metrics-chart').highcharts('StockChart', {
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
        data: data.data,
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
  });
});
