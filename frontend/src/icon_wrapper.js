import React, {Component} from 'react';
import PropTypes from 'prop-types';

const getStyleClassFromColor = (totalColor, colors) =>
  new Array(totalColor)
    .fill(1)
    .reduce((accu, c, i) => `${accu}.cr${i + 1} {fill:${colors[i % colors.length]};}`, '');

export default class IconWrapper extends Component {
  static displayName() {
    return 'Base Icon';
  }

  static propTypes() {
    return {
      /** Set the height of the icon, ex. '16px' */
      height: PropTypes.string,
      /** Set the width of the icon, ex. '16px' */
      width: PropTypes.string,
      /** Set the viewbox of the svg */
      viewBox: PropTypes.string,
      /** Path element */
      children: PropTypes.node,

      predefinedClassName: PropTypes.string,
      className: PropTypes.string
    };
  }

  static defaultProps() {
    return {
      height: null,
      width: null,
      viewBox: '0 0 64 64',
      predefinedClassName: '',
      className: ''
    };
  }

  render() {
    const {
      height,
      width,
      viewBox,
      style = {},
      children,
      predefinedClassName,
      className,
      colors,
      totalColor,
      ...props
    } = this.props;
    const svgHeight = height;
    const svgWidth = width || svgHeight;
    style.fill = 'currentColor';

    const fillStyle =
      Array.isArray(colors) && totalColor && getStyleClassFromColor(totalColor, colors);

    return (
      <svg
        viewBox={viewBox}
        width={svgWidth}
        height={svgHeight}
        style={style}
        className={`${predefinedClassName} ${className}`}
        {...props}
      >
        {fillStyle ? <style type="text/css">{fillStyle}</style> : null}
        {children}
      </svg>
    );
  }
}