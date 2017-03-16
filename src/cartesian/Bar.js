/**
 * @fileOverview Render a group of bar
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Animate, { translateStyle } from 'react-smooth';
import _ from 'lodash';
import Rectangle from '../shape/Rectangle';
import Layer from '../container/Layer';
import Text from '../component/Text';
import ErrorBar from './ErrorBar';
import pureRender from '../util/PureRender';
import { getValueByDataKey, uniqueId } from '../util/DataUtils';
import {
  PRESENTATION_ATTRIBUTES, EVENT_ATTRIBUTES, getPresentationAttributes,
  filterEventsOfChild, isSsr, findChildByType, getAnimationAttributes
} from '../util/ReactUtils';

@pureRender
class Bar extends Component {

  static displayName = 'Bar';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    ...EVENT_ATTRIBUTES,
    className: PropTypes.string,
    layout: PropTypes.oneOf(['vertical', 'horizontal']),
    xAxisId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    yAxisId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    yAxis: PropTypes.object,
    xAxis: PropTypes.object,
    stackId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    barSize: PropTypes.number,
    unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]).isRequired,
    legendType: PropTypes.oneOf([
      'line', 'square', 'rect', 'circle', 'cross', 'diamond', 'square', 'star',
      'triangle', 'wye',
    ]),
    minPointSize: PropTypes.number,
    maxBarSize: PropTypes.number,

    shape: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
    label: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.func, PropTypes.object, PropTypes.element,
    ]),
    data: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
      radius: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    })),
    onAnimationStart: PropTypes.func,
    onAnimationEnd: PropTypes.func,

    animationId: PropTypes.number,
    isAnimationActive: PropTypes.bool,
    isInitialAnimationActive: PropTypes.bool,
    isUpdateAnimationActive: PropTypes.bool,
    animationBegin: PropTypes.number,
    animationDuration: PropTypes.number,
    animationEasing: PropTypes.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  };

  static defaultProps = {
    xAxisId: 0,
    yAxisId: 0,
    legendType: 'rect',
    minPointSize: 0,
    // data of bar
    data: [],
    layout: 'vertical',
    isAnimationActive: !isSsr(),
    isInitialAnimationActive: false,
    isUpdateAnimationActive: false,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',

    onAnimationStart: () => { },
    onAnimationEnd: () => { },
  };

  state = { isAnimationFinished: false };
  id = uniqueId('recharts-bar-');

  handleAnimationEnd = () => {
    this.setState({ isAnimationFinished: true });
    this.props.onAnimationEnd();
  };

  handleAnimationStart = () => {
    this.setState({ isAnimationFinished: false });
    this.props.onAnimationStart();
  };

  renderRectangle(option, props) {
    let rectangle;

    if (React.isValidElement(option)) {
      rectangle = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      rectangle = option(props);
    } else {
      rectangle = <Rectangle {...props} />;
    }

    return rectangle;
  }

  renderRectangles() {
    const { data, shape, layout } = this.props;

    const baseProps = getPresentationAttributes(this.props);

    const animationProps = getAnimationAttributes(this.props, this.handleAnimationStart, this.handleAnimationEnd)

    const getStyle = isBegin => ({
      transform: `scale${layout === 'vertical' ? 'X' : 'Y'}(${isBegin ? 0 : 1})`,
    });

    return data.map((entry, index) => {
      const { x, y, width, height } = entry;

      const props = {
        ...baseProps,
        ...entry,
        ...animationProps,
        index,
      };

      if (_.isNil(entry.value) || !animationProps.isAnimationActive) {

        return (
          <Animate
            isActive={false}
            key={`rectangle-${index}${animationProps.isUpdateAnimationActive ? '-0' : ''}`}
          >
            <Layer
              className="recharts-bar-rectangle"
              {...filterEventsOfChild(this.props, entry, index) }
              key={`rectangle-${index}`}
            >
              {this.renderRectangle(shape, props)}
            </Layer>
          </Animate>
        );
      }

      let transformOrigin = '';

      if (layout === 'vertical') {
        transformOrigin = `${x}px ${y + height / 2}px`;
      } else {
        transformOrigin = `${x + width / 2}px ${y + height}px`;
      }

      return (
        <Animate
          begin={animationProps.animationBegin}
          duration={animationProps.animationDuration}
          isActive={animationProps.isAnimationActive}
          easing={animationProps.animationEasing}
          from={getStyle(true)}
          to={getStyle(false)}
          key={`rectangle-${index}-${props.animationId}`}
          onAnimationEnd={animationProps.onAnimationEnd}
          onAnimationStart={animationProps.onAnimationStart}
        >
          <Layer
            className="recharts-bar-rectangle"
            style={translateStyle({ transformOrigin })}
            {...filterEventsOfChild(this.props, entry, index) }
            key={`rectangle-${index}`}
          >
            {this.renderRectangle(shape, props)}
          </Layer>
        </Animate>
      );
    });
  }

  renderLabelItem(option, props, value) {
    let labelItem = null;

    if (React.isValidElement(option)) {
      labelItem = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      labelItem = option(props);
    } else {
      labelItem = (
        <Text
          {...props}
          key={props.key}
          className="recharts-bar-label"
        >
          {_.isArray(value) ? value[1] : value}
        </Text>
      );
    }

    return labelItem;
  }

  renderLabels() {
    const { isAnimationActive } = this.props;

    if (isAnimationActive && !this.state.isAnimationFinished) { return null; }

    const { data, label, layout } = this.props;
    const barProps = getPresentationAttributes(this.props);
    const customLabelProps = getPresentationAttributes(label);
    const textAnchor = layout === 'vertical' ? 'start' : 'middle';
    const labels = data.map((entry, i) => {
      let x = 0;
      let y = 0;

      if (layout === 'vertical') {
        x = 5 + entry.x + entry.width;
        y = 5 + entry.y + entry.height / 2;
      } else {
        x = entry.x + entry.width / 2;
        y = entry.y - 5;
      }

      const labelProps = {
        textAnchor,
        ...barProps,
        ...entry,
        ...customLabelProps,
        x,
        y,
        index: i,
        key: `label-${i}`,
        payload: entry.payload,
      };

      let labelValue = entry.value;
      if (label === true && entry.value && labelProps.label) {
        labelValue = labelProps.label;
      }
      return this.renderLabelItem(label, labelProps, labelValue);
    });

    return <Layer className="recharts-bar-labels">{labels}</Layer>;
  }

  renderErrorBar() {
    if (this.props.isAnimationActive && !this.state.isAnimationFinished) { return null; }

    const { data, xAxis, yAxis, layout, children } = this.props;
    const errorBarItem = findChildByType(children, ErrorBar);

    if (!errorBarItem) { return null; }

    const offset = (layout === 'vertical') ? data[0].height / 2 : data[0].width / 2;

    function dataPointFormatter(dataPoint, dataKey) {
      return {
        x: dataPoint.x,
        y: dataPoint.y,
        value: dataPoint.value,
        errorVal: getValueByDataKey(dataPoint, dataKey),
      };
    }

    return React.cloneElement(errorBarItem, {
      data,
      xAxis,
      yAxis,
      layout,
      offset,
      dataPointFormatter,
    });
  }

  render() {
    const { data, className, label, xAxis, yAxis, left, top, width, height } = this.props;

    if (!data || !data.length) { return null; }

    const layerClass = classNames('recharts-bar', className);
    const needClip = (xAxis && xAxis.allowDataOverflow) || (yAxis && yAxis.allowDataOverflow);

    return (
      <Layer className={layerClass}>
        {needClip ? (
          <defs>
            <clipPath id={`clipPath-${this.id}`}>
              <rect x={left} y={top} width={width} height={height} />
            </clipPath>
          </defs>
        ) : null}
        <Layer
          className="recharts-bar-rectangles"
          clipPath={needClip ? `url(#clipPath-${this.id})` : null}
        >
          {this.renderRectangles()}
        </Layer>
        {label && (
          <Layer className="recharts-bar-rectangle-labels">
            {this.renderLabels()}
          </Layer>
        )}
        {this.renderErrorBar()}
      </Layer>
    );
  }
}

export default Bar;
