import React from 'react';
import {
  BarChart, Bar, Brush, Cell, CartesianGrid, ReferenceLine, ReferenceDot,
  XAxis, YAxis, Tooltip, Legend, ErrorBar
} from 'recharts';
import _ from 'lodash';
import { changeNumberOfData } from './utils';

const data = [
  { name: 'food', uv: 2000, pv: 2013, amt: 4500, time: 1, uvError: [100, 50], pvError: [110, 20] },
  { name: 'cosmetic', uv: 3300, pv: 2000, amt: 6500, time: 2, uvError: 120, pvError: 50 },
  { name: 'storage', uv: 3200, pv: 1398, amt: 5000, time: 3, uvError: [120, 80], pvError: [200, 100] },
  { name: 'digital', uv: 2800, pv: 2800, amt: 4000, time: 4, uvError: 100, pvError: 30 },
];

const initilaState = {
  data,
};

export default class Animations extends React.Component {
  displayName = 'BarChartDemo'
  state = initilaState

  handleChangeData() {
    this.setState(() => _.mapValues(initilaState, changeNumberOfData));
  }

  handleBarAnimationStart() {
    console.log('Animation start');
  }

  handleBarAnimationEnd() {
    console.log('Animation end');
  }

  render() {
    const { data, data01, data02 } = this.state;

    return (
      <div className="bar-charts">
        <a
          href="javascript: void(0);"
          className="btn update"
          onClick={this.handleChangeData.bind(this)}
        >
          change data
        </a>
        <br />

        <p>BarChart of layout vertical</p>
        <div className="bar-chart-wrapper">
          <BarChart width={400} height={400} data={data} layout="vertical" maxBarSize={10} >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <CartesianGrid horizontal={false} />
            <Bar
              dataKey="uv"
              fill="#FF0000"
              maxBarSize={15}
              isAnimationActive={false}
            />
            <Bar
              dataKey="uv"
              fill="#00FF00"
              maxBarSize={15}
              isAnimationActive={true}
            />
            <Bar
              dataKey="uv"
              fill="#0000FF"
              isUpdateAnimationActive={true}
            />
            <Bar
              dataKey="uv"
              fill="#FFFF00"
              maxBarSize={15}
              animationDuration={500}
              isUpdateAnimationActive={true}
              isInitialAnimationActive={true}
            />
            <Tooltip />
          </BarChart>
        </div>

      </div>
    );
  }
}
