import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';
import { BUCKET_LABELS, SPEED_CAT_META, carrierName } from './constants';

const DS = MOCK.delivery_speed;
const CARRIERS_REV = [...DS.avg_transit_by_carrier].reverse();

function transitColor(v: number): string {
  if (v <= 1.5) return '#22c55e';
  if (v <= 2.5) return '#84cc16';
  if (v <= 3.5) return '#f97316';
  return '#ef4444';
}

@Component({
  selector: 'app-delivery-speed',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <h2 class="text-base font-bold text-gray-900 mb-1">Delivery Speed</h2>
    <p class="text-sm text-gray-500 mb-5">Delivery time is measured from the first tracking scan to the moment the parcel is marked as delivered.</p>

    <!-- 4 KPI cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Average</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.delivery_speed.kpis.avg_transit_days }} days</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Most Common (median)</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.delivery_speed.kpis.median_transit_days }} days</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Fastest 10%</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.delivery_speed.kpis.p10_transit_days }} days</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Slowest 10%</p>
        <p class="text-2xl font-bold text-red-500">{{ mock.delivery_speed.kpis.p90_transit_days }} days</p>
      </div>
    </div>

    <!-- Histogram + avg by carrier -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">How Long Does Delivery Take?</h3>
        <div echarts [options]="histogramOptions" style="height:280px;"></div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Average Delivery Time by Carrier</h3>
        <div echarts [options]="avgCarrierOptions" style="height:280px;"></div>
      </div>
    </div>

    <!-- Speed categories -->
    <div class="bg-white rounded-lg border border-gray-200 p-5">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Deliveries by Speed Category</h3>
      <div echarts [options]="categoryOptions" style="height:220px;"></div>
    </div>
  `,
})
export class DeliverySpeedComponent {
  mock = MOCK;

  histogramOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 16, right: 16, bottom: 44, left: 56 },
    xAxis: {
      type: 'category',
      data: DS.histogram.map(d => BUCKET_LABELS[d.bucket_key] ?? d.bucket_key),
      name: 'Days to Deliver',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Shipments',
      nameLocation: 'middle',
      nameGap: 44,
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        type: 'bar',
        data: DS.histogram.map(d => d.count),
        itemStyle: { color: '#3b82f6' },
        barCategoryGap: '12%',
        markLine: {
          symbol: 'none',
          data: [{ xAxis: 6 }],
          lineStyle: { color: '#ef4444', type: 'dashed', width: 1.5 },
          label: { show: false },
          silent: true,
        },
      },
    ],
  };

  avgCarrierOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}d` },
    grid: { top: 8, right: 48, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: CARRIERS_REV.map(c => carrierName(c.carrier)), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(CARRIERS_REV.length),
      data: CARRIERS_REV.map(c => ({ value: c.avg_transit_days, itemStyle: { color: transitColor(c.avg_transit_days), borderRadius: [0, 3, 3, 0] } })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}d`, color: '#6b7280', fontSize: 11 },
    }],
  };

  categoryOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 8, right: 16, bottom: 30, left: 52 },
    xAxis: {
      type: 'category',
      data: DS.speed_categories.map(c => SPEED_CAT_META[c.key]?.label ?? c.key),
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      type: 'bar',
      data: DS.speed_categories.map(c => ({ value: c.count, itemStyle: { color: SPEED_CAT_META[c.key]?.color ?? '#94a3b8' } })),
      barWidth: '45%',
    }],
  };
}
