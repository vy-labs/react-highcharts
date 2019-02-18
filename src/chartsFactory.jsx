var React = require('react');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');
var win = typeof global === 'undefined' ? window : global;

module.exports = function (chartTypeExport, Highcharts){
  var displayName = 'Highcharts' + chartTypeExport;
  var result = createReactClass({
    displayName: displayName,

    propTypes: {
      config: PropTypes.object,
      isPureConfig: PropTypes.bool,
      neverReflow: PropTypes.bool,
      callback: PropTypes.func,
      domProps: PropTypes.object
    },
    getDefaultProps: function() {
      return {
        callback: () =>{},
        domProps: {}
      };
    },
    setChartRef: function(chartRef) {
      this.chartRef = chartRef;
    },
    renderChart: function (config){
      if (!config) {
        throw new Error('Config must be specified for the ' + displayName + ' component');
      }
      let chartConfig = config.chart;
      this.chart = new Highcharts[chartTypeExport]({
        ...config,
        chart: {
          ...chartConfig,
          renderTo: this.chartRef
        }
      }, this.props.callback);

      if (!this.props.neverReflow) {
        win && win.requestAnimationFrame && requestAnimationFrame(()=>{
          this.chart && this.chart.options && this.chart.reflow();
        });
      }
    },

    shouldComponentUpdate(nextProps) {
      if (nextProps.neverReflow || (nextProps.isPureConfig && this.props.config === nextProps.config)) {
        return true;
      }
      this.renderChart(nextProps.config);
      return false;
    },

    getChart: function (){
      if (!this.chart) {
        throw new Error('getChart() should not be called before the component is mounted');
      }
      return this.chart;
    },

    componentDidMount: function (){
      this.renderChart(this.props.config);
    },

    componentWillUnmount() {
      this.chart.destroy();
    },

    render: function (){
      return <div ref={this.setChartRef} {...this.props.domProps} />;
    }
  });

  result.Highcharts = Highcharts;
  result.withHighcharts = (Highcharts, chartType) => {
    return module.exports(chartType || chartTypeExport, Highcharts);
  };
  return result;
};

