import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { KLineDataItem, MALineDataItem } from '@/types/stock';
import { K_TYPE_OPTIONS, KType } from '@/types/stock';

interface StockChartProps {
  data: KLineDataItem[];
  maData: MALineDataItem[];
  stockCode: string;
  kType: KType;
}

export const StockChart: React.FC<StockChartProps> = ({ data, maData, stockCode, kType }) => {
  const option: EChartsOption = useMemo(() => {
    // 数据按时间排序（从旧到新）
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const sortedMaData = [...maData].sort((a, b) => a.timestamp - b.timestamp);

    // 提取日期和K线数据
    const dates = sortedData.map(item => item.time);
    const klineData = sortedData.map(item => [
      item.open,
      item.close,
      item.low,
      item.high,
    ]);
    const volumes = sortedData.map(item => item.volume);
    
    // 提取MA数据
    const ma5Data = sortedMaData.map(item => item.ma5);
    const ma10Data = sortedMaData.map(item => item.ma10);
    const ma20Data = sortedMaData.map(item => item.ma20);

    const kTypeLabel = K_TYPE_OPTIONS.find(opt => opt.value === kType)?.label || '';

    return {
      animation: true,
      backgroundColor: '#ffffff',
      title: {
        text: `${stockCode} K线图 + MA均线`,
        subtext: `周期: ${kTypeLabel} | 共 ${sortedData.length} 条数据`,
        left: 'center',
        top: -5,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1f2937',
        },
        subtextStyle: {
          fontSize: 13,
          color: '#6b7280',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 15,
        textStyle: {
          color: '#374151',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const item = sortedData[dataIndex];
          const maItem = sortedMaData[dataIndex];
          const change = item.close - item.open;
          const changePercent = ((change / item.open) * 100).toFixed(2);
          const changeColor = change >= 0 ? '#ef4444' : '#22c55e';
          
          return `
            <div style="min-width: 220px;">
              <div style="font-weight: 600; margin-bottom: 10px; font-size: 14px; color: #111827;">
                ${item.time}
              </div>
              <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 15px; font-size: 13px;">
                <span style="color: #6b7280;">开盘:</span>
                <span style="color: #1f2937; font-weight: 600;">${item.open.toFixed(2)}</span>
                
                <span style="color: #6b7280;">收盘:</span>
                <span style="color: ${changeColor}; font-weight: 700;">
                  ${item.close.toFixed(2)} 
                  <span style="font-size: 11px;">(${change >= 0 ? '+' : ''}${change.toFixed(2)} / ${changePercent}%)</span>
                </span>
                
                <span style="color: #6b7280;">最高:</span>
                <span style="color: #ef4444; font-weight: 600;">${item.high.toFixed(2)}</span>
                
                <span style="color: #6b7280;">最低:</span>
                <span style="color: #22c55e; font-weight: 600;">${item.low.toFixed(2)}</span>
                
                <span style="color: #6b7280;">成交量:</span>
                <span style="font-weight: 600; color: #1f2937;">${item.volume.toLocaleString()}</span>
                
                <span style="color: #6b7280;">成交额:</span>
                <span style="font-weight: 600; color: #1f2937;">${(item.turnover / 10000).toFixed(2)}万</span>
                
                <div style="grid-column: 1/-1; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 5px; color: #6b7280;">均线</div>
                  <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px 10px;">
                    <span style="color: #f59e0b;">MA5:</span>
                    <span style="font-weight: 600;">${maItem.ma5?.toFixed(2) || '-'}</span>
                    <span style="color: #3b82f6;">MA10:</span>
                    <span style="font-weight: 600;">${maItem.ma10?.toFixed(2) || '-'}</span>
                    <span style="color: #8b5cf6;">MA20:</span>
                    <span style="font-weight: 600;">${maItem.ma20?.toFixed(2) || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: ['K线', 'MA5', 'MA10', 'MA20', '成交量'],
        top: 45,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: 90,
          height: '50%',
          backgroundColor: '#fafafa',
        },
        {
          left: '3%',
          right: '3%',
          top: '70%',
          height: '16%',
          backgroundColor: '#fafafa',
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          axisLabel: {
            rotate: 30,
            fontSize: 11,
            color: '#6b7280',
            interval: Math.floor(dates.length / 10) || 0,
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb',
            },
          },
        },
        {
          type: 'category',
          data: dates,
          gridIndex: 1,
          axisLabel: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb',
            },
          },
        },
      ],
      yAxis: [
        {
          scale: true,
          gridIndex: 0,
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e5e7eb',
              type: 'dashed',
            },
          },
          axisLine: {
            show: false,
          },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(1) + '万';
              }
              return value.toString();
            }
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
          minValueSpan: 5,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: 5,
          start: 0,
          end: 100,
          height: 25,
          handleSize: '110%',
          handleStyle: {
            color: '#3b82f6',
          },
          textStyle: {
            fontSize: 11,
            color: '#6b7280',
          },
          borderColor: '#e5e7eb',
          fillerColor: 'rgba(59, 130, 246, 0.1)',
          dataBackground: {
            lineStyle: {
              color: '#3b82f6',
              width: 1,
            },
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.2)',
            },
          },
        },
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: klineData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#ef4444',
            color0: '#22c55e',
            borderColor: '#dc2626',
            borderColor0: '#16a34a',
            borderWidth: 1.5,
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
            },
          },
        },
        {
          name: 'MA5',
          type: 'line',
          data: ma5Data,
          xAxisIndex: 0,
          yAxisIndex: 0,
          smooth: true,
          lineStyle: {
            color: '#f59e0b',
            width: 2,
          },
          showSymbol: false,
        },
        {
          name: 'MA10',
          type: 'line',
          data: ma10Data,
          xAxisIndex: 0,
          yAxisIndex: 0,
          smooth: true,
          lineStyle: {
            color: '#3b82f6',
            width: 2,
          },
          showSymbol: false,
        },
        {
          name: 'MA20',
          type: 'line',
          data: ma20Data,
          xAxisIndex: 0,
          yAxisIndex: 0,
          smooth: true,
          lineStyle: {
            color: '#8b5cf6',
            width: 2,
          },
          showSymbol: false,
        },
        {
          name: '成交量',
          type: 'bar',
          data: volumes,
          xAxisIndex: 1,
          yAxisIndex: 1,
          barWidth: '60%',
          itemStyle: {
            color: (params: any) => {
              const item = sortedData[params.dataIndex];
              return item.close >= item.open 
                ? 'rgba(239, 68, 68, 0.8)' 
                : 'rgba(34, 197, 94, 0.8)';
            },
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
            },
          },
        },
      ],
    };
  }, [data, maData, stockCode, kType]);

  return (
    <div className="w-full h-full p-3">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};
