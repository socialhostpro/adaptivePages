/**
 * Charts Component - Line, Bar, Pie, Donut, Area, Gauge, Sparkline charts
 * Part of the AdaptivePages Shared Component System
 */

import React, { useRef, useEffect, useState } from 'react';

// Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface BaseChartProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export interface LineChartProps extends BaseChartProps {
  data: ChartSeries[];
  labels: string[];
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
}

export interface BarChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  horizontal?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  barWidth?: number;
}

export interface PieChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  donut?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  innerRadius?: number;
}

export interface GaugeChartProps extends BaseChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
  showValue?: boolean;
  threshold?: Array<{ value: number; color: string; label?: string }>;
}

export interface SparklineProps extends BaseChartProps {
  data: number[];
  color?: string;
  fillArea?: boolean;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

// Simple SVG-based chart implementations (production would use Chart.js, Recharts, etc.)

export function LineChart({
  data,
  labels,
  width = '100%',
  height = 300,
  smooth = true,
  showGrid = true,
  showLegend = true,
  strokeWidth = 2,
  className = '',
  loading = false,
  error,
  title,
  subtitle
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setSvgSize({ width: rect.width, height: rect.height });
    }
  }, [width, height]);

  if (loading) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
          <span>Error loading chart: {error}</span>
        </div>
      </div>
    );
  }

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = svgSize.width - margin.left - margin.right;
  const chartHeight = svgSize.height - margin.top - margin.bottom;

  // Find min/max values
  const allValues = data.flatMap(series => series.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;

  // Scale functions
  const xScale = (index: number) => (index / (labels.length - 1)) * chartWidth;
  const yScale = (value: number) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Generate path for line
  const generatePath = (seriesData: number[]) => {
    return seriesData.map((value, index) => {
      const x = xScale(index);
      const y = yScale(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className={`chart-container overflow-hidden ${className}`} style={{ width, height }}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <svg ref={svgRef} width="100%" height="100%" className="overflow-visible">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <g className="grid">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={0}
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-gray-400"
                />
              ))}
              {/* Vertical grid lines */}
              {labels.map((_, index) => (
                <line
                  key={index}
                  x1={xScale(index)}
                  y1={0}
                  x2={xScale(index)}
                  y2={chartHeight}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-gray-400"
                />
              ))}
            </g>
          )}

          {/* Lines */}
          {data.map((series, seriesIndex) => (
            <path
              key={series.name}
              d={generatePath(series.data)}
              fill="none"
              stroke={series.color || colors[seriesIndex % colors.length]}
              strokeWidth={strokeWidth}
              className="transition-all duration-300 hover:stroke-opacity-80"
            />
          ))}

          {/* Data points */}
          {data.map((series, seriesIndex) =>
            series.data.map((value, pointIndex) => (
              <circle
                key={`${seriesIndex}-${pointIndex}`}
                cx={xScale(pointIndex)}
                cy={yScale(value)}
                r={3}
                fill={series.color || colors[seriesIndex % colors.length]}
                className="transition-all duration-300 hover:r-4"
              />
            ))
          )}

          {/* X-axis labels */}
          {labels.map((label, index) => (
            <text
              key={index}
              x={xScale(index)}
              y={chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {label}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = minValue + (valueRange * (1 - ratio));
            return (
              <text
                key={ratio}
                x={-10}
                y={chartHeight * ratio + 5}
                textAnchor="end"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {Math.round(value)}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4">
          {data.map((series, index) => (
            <div key={series.name} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: series.color || colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{series.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  data,
  width = '100%',
  height = 300,
  horizontal = false,
  showValues = true,
  showGrid = true,
  barWidth = 20,
  className = '',
  loading = false,
  error,
  title,
  subtitle
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setSvgSize({ width: rect.width, height: rect.height });
    }
  }, [width, height]);

  if (loading) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
          <span>Error loading chart: {error}</span>
        </div>
      </div>
    );
  }

  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = svgSize.width - margin.left - margin.right;
  const chartHeight = svgSize.height - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className={`chart-container ${className}`} style={{ width, height }}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <svg ref={svgRef} width="100%" height="100%" className="overflow-visible">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && !horizontal && (
            <g className="grid">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={0}
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-gray-400"
                />
              ))}
            </g>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = horizontal ? 0 : (index * (chartWidth / data.length)) + (chartWidth / data.length - barWidth) / 2;
            const y = horizontal ? index * (chartHeight / data.length) : chartHeight - barHeight;
            const width = horizontal ? (item.value / maxValue) * chartWidth : barWidth;
            const height = horizontal ? chartHeight / data.length * 0.8 : barHeight;

            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={item.color || colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                  rx={2}
                />
                
                {/* Value labels */}
                {showValues && (
                  <text
                    x={horizontal ? x + width + 5 : x + barWidth / 2}
                    y={horizontal ? y + height / 2 + 5 : y - 5}
                    textAnchor={horizontal ? 'start' : 'middle'}
                    className="text-xs fill-gray-700 dark:fill-gray-300"
                  >
                    {item.value}
                  </text>
                )}

                {/* Labels */}
                <text
                  x={horizontal ? -10 : x + barWidth / 2}
                  y={horizontal ? y + height / 2 + 5 : chartHeight + 20}
                  textAnchor={horizontal ? 'end' : 'middle'}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function PieChart({
  data,
  width = 300,
  height = 300,
  donut = false,
  showLabels = true,
  showPercentages = true,
  innerRadius = 0,
  className = '',
  loading = false,
  error,
  title,
  subtitle
}: PieChartProps) {
  if (loading) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
          <span>Error loading chart: {error}</span>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = (typeof width === 'number' ? width : 300) / 2;
  const centerY = (typeof height === 'number' ? height : 300) / 2;
  const radius = Math.min(centerX, centerY) - 20;
  const actualInnerRadius = donut ? (innerRadius || radius * 0.6) : 0;

  let currentAngle = -90; // Start from top

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const outerArc = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ];

    if (actualInnerRadius > 0) {
      const innerStart = polarToCartesian(centerX, centerY, actualInnerRadius, endAngle);
      const innerEnd = polarToCartesian(centerX, centerY, actualInnerRadius, startAngle);
      return outerArc.concat([
        "L", innerEnd.x, innerEnd.y,
        "A", actualInnerRadius, actualInnerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
      ]).join(" ");
    } else {
      return outerArc.concat(["L", centerX, centerY, "Z"]).join(" ");
    }
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  return (
    <div className={`chart-container ${className}`} style={{ width, height }}>
      {(title || subtitle) && (
        <div className="mb-4 text-center">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div className="flex items-center space-x-8">
        <svg width={width} height={height} className="flex-shrink-0">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const path = createArcPath(currentAngle, currentAngle + angle);
            
            // Label position
            const labelAngle = currentAngle + angle / 2;
            const labelRadius = (radius + actualInnerRadius) / 2;
            const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);
            
            currentAngle += angle;

            return (
              <g key={item.label}>
                <path
                  d={path}
                  fill={item.color || colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
                
                {showLabels && percentage > 5 && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {showPercentages ? `${percentage.toFixed(1)}%` : item.value}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center label for donut */}
          {donut && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              className="text-lg font-bold fill-gray-900 dark:fill-white"
            >
              Total: {total}
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-col space-y-2">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <div key={item.label} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.value} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#3B82F6',
  fillArea = false,
  showDots = false,
  trend,
  className = ''
}: SparklineProps) {
  if (data.length === 0) return null;

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const valueRange = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (typeof width === 'number' ? width : 100);
    const y = (typeof height === 'number' ? height : 30) - ((value - minValue) / valueRange) * (typeof height === 'number' ? height : 30);
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M ${points.split(' ').join(' L ')}`;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {fillArea && (
          <path
            d={`${pathD} L ${typeof width === 'number' ? width : 100},${height} L 0,${height} Z`}
            fill={color}
            fillOpacity={0.2}
          />
        )}
        
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {showDots && data.map((value, index) => {
          const x = (index / (data.length - 1)) * (typeof width === 'number' ? width : 100);
          const y = (typeof height === 'number' ? height : 30) - ((value - minValue) / valueRange) * (typeof height === 'number' ? height : 30);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={2}
              fill={color}
            />
          );
        })}
      </svg>
      
      {trend && (
        <span className={`text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}
        </span>
      )}
    </div>
  );
}
