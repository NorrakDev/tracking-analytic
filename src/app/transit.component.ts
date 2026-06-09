import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';

const SORTED = [...MOCK.transit.avg_by_carrier].sort((a, b) => a.avg_days - b.avg_days);

@Component({
  selector: 'app-transit',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div class="card p-5">
        <h3 class="card-title mb-4">Transit Time Distribution</h3>
        <div echarts [options]="distributionOptions" style="height:240px;"></div>
      </div>
      <div class="card p-5">
        <h3 class="card-title mb-1">Avg Transit Time by Carrier</h3>
        <p class="text-xs text-slate-400 mb-4">Bar shows min–max range; dot marks average</p>
        <div echarts [options]="avgTransitOptions" style="height:240px;"></div>
      </div>
    </div>

    <!-- Transit table -->
    <div class="card overflow-hidden">
      <div class="card-header">
        <h3 class="card-title">Transit Time Details by Carrier</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="th">Carrier</th>
              <th class="th text-right">Min Days</th>
              <th class="th text-right">Avg Days</th>
              <th class="th text-right">Max Days</th>
              <th class="th">Range Visualization</th>
            </tr>
          </thead>
          <tbody>
            @for (c of sorted; track c.carrier) {
              <tr class="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                <td class="td font-medium text-slate-900">{{ c.carrier }}</td>
                <td class="td text-right text-slate-700">{{ c.min_days }}d</td>
                <td class="td text-right font-semibold text-blue-600">{{ c.avg_days }}d</td>
                <td class="td text-right text-slate-700">{{ c.max_days }}d</td>
                <td class="td min-w-[200px]">
                  <div class="relative h-3 bg-slate-100 rounded-full">
                    <!-- range bar -->
                    <div
                      class="absolute h-3 bg-blue-200 rounded-full"
                      [style.left]="rangeLeft(c.min_days) + '%'"
                      [style.width]="rangeWidth(c.min_days, c.max_days) + '%'"
                    ></div>
                    <!-- avg marker -->
                    <div
                      class="absolute w-2.5 h-2.5 bg-blue-600 rounded-full top-0.5 -translate-x-1/2"
                      [style.left]="rangeLeft(c.avg_days) + '%'"
                    ></div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TransitComponent {
  mock = MOCK;
  sorted = SORTED;

  readonly MAX_SCALE = 50;

  rangeLeft(days: number): number { return (days / this.MAX_SCALE) * 100; }
  rangeWidth(min: number, max: number): number { return ((max - min) / this.MAX_SCALE) * 100; }

  distributionOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 10, right: 16, bottom: 30, left: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: MOCK.transit.distribution.map(d => d.range),
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [{
      type: 'bar',
      data: MOCK.transit.distribution.map((d, i) => ({
        value: d.count,
        itemStyle: {
          color: ['#bfdbfe', '#93c5fd', '#2563eb', '#1d4ed8', '#1e3a8a'][i] ?? '#2563eb',
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barMaxWidth: 56,
      label: {
        show: true, position: 'top',
        formatter: (p: any) => p.value.toLocaleString('en-US'),
        color: '#64748b', fontSize: 11,
      },
    }],
  };

  avgTransitOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Range (min–max)', 'Average'], bottom: 0, textStyle: { color: '#64748b', fontSize: 12 } },
    grid: { top: 10, right: 24, bottom: 40, left: 16, containLabel: true },
    xAxis: {
      type: 'value', name: 'days',
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    yAxis: {
      type: 'category',
      data: SORTED.map(c => c.carrier),
      axisLabel: { color: '#64748b', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Range (min–max)',
        type: 'bar',
        stack: 'transit',
        data: SORTED.map(c => ({ value: c.min_days, itemStyle: { color: 'transparent' } })),
        barMaxWidth: 22,
      },
      {
        name: 'Range (min–max)',
        type: 'bar',
        stack: 'transit',
        data: SORTED.map(c => ({
          value: c.max_days - c.min_days,
          itemStyle: { color: '#bfdbfe', borderRadius: [0, 4, 4, 0] },
        })),
        barMaxWidth: 22,
      },
      {
        name: 'Average',
        type: 'scatter',
        data: SORTED.map(c => [c.avg_days, c.carrier]),
        symbolSize: 10,
        itemStyle: { color: '#2563eb' },
        z: 10,
      },
    ],
  };
}
