import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import d3 from 'd3';
import dimple from 'dimple';
import $ from 'jquery';
import _ from 'lodash';
import numeral from 'numeral';

class IndicatorsChart extends React.Component {

  static defaultProps = {
    width: '50%',
    height: '200px'
  }

  static chart = null

  updateChart(props) {
    const { kexp, krdel, components } = props;
    const activecomponents = components.filter(
      (component) => { return component.active; }
    );

    $.ajax({
      url: 'http://localhost:8000/epindicators',
      method: 'POST', // http method
      dataType: 'json',
      data: JSON.stringify({
        kexp: kexp,
        krdel: krdel,
        components: activecomponents
      }),
      crossDomain: false, // needed so request.is_ajax works
      success: (json) => {
        const data = [
          { Paso: 'A', Componente: 'EP_nren', 'kWh/m²·año': json.EPAnren },
          { Paso: 'A', Componente: 'EP_ren', 'kWh/m²·año': json.EPAren },
          { Paso: 'A', Componente: 'EP_total', 'kWh/m²·año': json.EPAtotal },
          { Paso: 'A+B', Componente: 'EP_nren', 'kWh/m²·año': json.EPnren },
          { Paso: 'A+B', Componente: 'EP_ren', 'kWh/m²·año': json.EPren },
          { Paso: 'A+B', Componente: 'EP_total', 'kWh/m²·año': json.EPtotal }
        ];
        this.chart.data = data;
        this.fixscale(data);
        this.chart.draw(100);
        this.drawSubtitle({ kexp, krdel,
                            EPArer: json.EPArer,
                            EPrer: json.EPrer });
      },
      error: (xhr, errmsg, err) => {
        console.log(xhr.status + ': ' + xhr.responseText);
      }
    });
  }

  fixscale(data) {
    const values = _.map(data, 'kWh/m²·año');

    let max = _.max(values);
    let min = _.min(values);
    let step = 10;

    if (Math.max(Math.abs(max), Math.abs(min)) > 100) { step = 100; }
    max = Math.round(max / step) * step;
    min = Math.round(min / step) * step;
    const y = this.chart.axes[1];
    y.overrideMax = max;
    y.overrideMin = min;
  }

  drawSubtitle(params) {
    const { kexp, krdel, EPrer, EPArer } = params;
    const svg = this.chart.svg;

    svg.select('#subtitle').remove();
    svg.append('text')
       .attr('id', 'subtitle')
       .attr('x', '50%').attr('y', '30px')
       .attr('text-anchor', 'middle')
       .style('fill', 'black')
       .style('font-size', '12px')
       .text('kexp: ' + numeral(kexp).format('0.0') +
             ', krdel: ' + numeral(krdel).format('0.0'));
    svg.select('#subsubtitle').remove();
    svg.append('text')
       .attr('id', 'subsubtitle')
       .attr('x', '50%').attr('y', '45px')
       .attr('text-anchor', 'middle')
       .style('fill', 'black')
       .style('font-size', '12px')
       .html('RER(A): ' + numeral(EPArer).format('0.00') +
             ', RER(A+B): ' + numeral(EPrer).format('0.00'));
  }

  drawChart(node, props) {
    const data = [
      { Paso: 'A', Componente: 'EP_nren', 'kWh/m²·año': 0.0 },
      { Paso: 'A', Componente: 'EP_ren', 'kWh/m²·año': 0.0 },
      { Paso: 'A', Componente: 'EP_total', 'kWh/m²·año': 0.0 },
      { Paso: 'A+B', Componente: 'EP_nren', 'kWh/m²·año': 0.0 },
      { Paso: 'A+B', Componente: 'EP_ren', 'kWh/m²·año': 0.0 },
      { Paso: 'A+B', Componente: 'EP_total', 'kWh/m²·año': 0.0 }
    ];

    const svg = d3.select(node).append('svg')
                  .attr('width', '100%')
                  .attr('height', '100%')
                  .style('overflow', 'visible');

    svg.append('text').attr('x', '50%').attr('y', '15px')
       .attr('text-anchor', 'middle')
       .style('fill', 'black').style('font-size', '15px')
       .text('Consumo de energía primaria');

    const c = new dimple.chart(svg, data);
    c.setMargins('50px', '50px', '20px', '45px'); // left, top, right, bottom
    this.chart = c;
    this.drawSubtitle({ krdel: 1.0, kexp: 1.0 });

    c.defaultColors = [new dimple.color('blue'),
                       new dimple.color('red'),
                       new dimple.color('green')];

    c.addCategoryAxis('x', ['Paso', 'Componente']);
    c.addMeasureAxis('y', 'kWh/m²·año');
    const s = c.addSeries('Componente', dimple.plot.bar);
    s.addOrderRule(['EP_total', 'EP_nren', 'EP_ren']);
    c.addLegend('0%', '90%', '100%', '50%', 'right');

    c.ease = 'linear';
    // c.draw(400);
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    this.drawChart(node, this.props);
    this.updateChart(this.props);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.components !== this.props.components |
        nextProps.krdel !== this.props.krdel |
        nextProps.kexp !== this.props.kexp) {
          this.updateChart(nextProps);
    }
    return false;
  }

  render() {
    return (<div style={ { width: this.props.width,
                           height: this.props.height } } />);
  }

}

export default IndicatorsChart = connect(state => {
  return {
    kexp: state.kexp,
    krdel: state.krdel,
    components: state.components
  };
})(IndicatorsChart);
