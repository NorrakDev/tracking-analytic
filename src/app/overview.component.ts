import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';
import { STATUS_META } from './constants';

const DV = MOCK.overview.daily_volume;

// x-axis labels: "Jan 6", "Jan 9" etc from ISO date string
function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <h2 class="text-base font-bold text-gray-900 mb-4">Overview</h2>

    <!-- 7 KPI cards -->
    <div class="grid grid-cols-7 gap-3 mb-6">
      <!-- Total Shipments -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Total Shipments</p>
        <p class="text-2xl font-bold text-gray-900 leading-none mb-1">100,000</p>
        <p class="text-xs text-gray-400">Jan 6 – Feb 4, 2026</p>
      </div>
      <!-- Pending -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Pending</p>
        <p class="text-2xl font-bold text-green-600 leading-none mb-1">{{ mock.overview.kpis.pending_pct }}%</p>
        <div class="flex items-center gap-1 text-xs text-gray-500">
          <svg class="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
          </svg>
          {{ mock.overview.kpis.pending_count.toLocaleString() }} trackers
        </div>
      </div>
      <!-- Delivery Rate -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Delivery Rate</p>
        <p class="text-2xl font-bold text-orange-500 leading-none mb-1">{{ mock.overview.kpis.delivery_rate_pct }}%</p>
        <p class="text-xs text-gray-400">{{ mock.overview.kpis.delivered_count.toLocaleString() }} delivered</p>
      </div>
      <!-- Resolution Rate -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Resolution Rate</p>
        <p class="text-2xl font-bold text-green-600 leading-none mb-1">{{ mock.overview.kpis.resolution_rate_pct }}%</p>
        <p class="text-xs text-gray-400">Delivered + Returned</p>
      </div>
      <!-- Active -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Active (excl. pending)</p>
        <p class="text-2xl font-bold text-gray-900 leading-none mb-1">{{ mock.overview.kpis.active_count.toLocaleString() }}</p>
        <p class="text-xs text-gray-400">In transit or awaiting</p>
      </div>
      <!-- Median Transit -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Median Transit Time</p>
        <p class="text-2xl font-bold text-orange-500 leading-none mb-1">{{ mock.overview.kpis.median_transit_days }} days</p>
        <p class="text-xs text-gray-400">First scan to delivery</p>
      </div>
      <!-- EDD -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">EDD On-Time or Early</p>
        <p class="text-2xl font-bold text-orange-500 leading-none mb-1">{{ mock.overview.kpis.edd_on_time_pct }}%</p>
        <p class="text-xs text-gray-400">from {{ mock.overview.kpis.edd_shipments_count.toLocaleString() }} shipments</p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-5 gap-4">
      <div class="col-span-3 bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-1">Daily Shipment Volume</h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
          <span>7-day avg: <strong class="text-gray-800">{{ mock.overview.volume_trend.last7_avg.toLocaleString() }} / day</strong></span>
          <span class="text-red-500 font-medium">{{ mock.overview.volume_trend.trend_pct }}% vs prev 7d</span>
          <span>Prev 7-day avg: <strong class="text-gray-800">{{ mock.overview.volume_trend.prev7_avg.toLocaleString() }} / day</strong></span>
        </div>
        <div echarts [options]="volumeOptions" style="height:260px;"></div>
      </div>
      <div class="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Active Shipments by Status</h3>
        <div echarts [options]="statusOptions" style="height:260px;"></div>
      </div>
    </div>
  `,
})
export class OverviewComponent {
  mock = MOCK;

  volumeOptions: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const list: any[] = Array.isArray(params) ? params : [params];
        const bar = list.find((p: any) => p.value != null && p.seriesType === 'bar');
        const avg = list.find((p: any) => p.seriesName === 'Rolling 7-day avg');
        const date = list[0]?.axisValue ?? '';
        let s = `<strong>${date}</strong><br/>`;
        if (bar) s += `${bar.marker} ${bar.seriesName}: <strong>${bar.value.toLocaleString()}</strong><br/>`;
        if (avg) s += `${avg.marker} 7-day avg: ${avg.value.toLocaleString()}`;
        return s;
      },
    },
    legend: {
      data: ['Weekday', 'Weekend', 'Rolling 7-day avg'],
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 11 },
    },
    grid: { top: 8, right: 8, bottom: 44, left: 48 },
    xAxis: {
      type: 'category',
      data: DV.map(d => fmtDate(d.date)),
      axisLabel: { color: '#9ca3af', fontSize: 9, interval: 2 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: 'Weekday',
        type: 'bar',
        stack: 'vol',
        data: DV.map(d => d.is_weekend ? null : d.count),
        itemStyle: { color: '#3b82f6' },
        barCategoryGap: '30%',
      },
      {
        name: 'Weekend',
        type: 'bar',
        stack: 'vol',
        data: DV.map(d => d.is_weekend ? d.count : null),
        itemStyle: { color: '#d1d5db' },
      },
      {
        name: 'Rolling 7-day avg',
        type: 'line',
        data: DV.map(d => Math.round(d.rolling7_avg)),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#f97316', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#f97316' },
        z: 10,
      },
    ],
  };

  statusOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: MOCK.overview.active_by_status.map(s => STATUS_META[s.status]?.label ?? s.status),
      axisLabel: { color: '#4b5563', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: MOCK.overview.active_by_status.map(s => ({
        value: s.count,
        itemStyle: {
          color: STATUS_META[s.status]?.color ?? '#94a3b8',
          borderRadius: [0, 3, 3, 0],
        },
      })),
      barMaxWidth: dynBarWidth(MOCK.overview.active_by_status.length),
      label: {
        show: true, position: 'right',
        formatter: (p: any) => p.value.toLocaleString(),
        color: '#6b7280', fontSize: 11,
      },
    }],
  };
}
