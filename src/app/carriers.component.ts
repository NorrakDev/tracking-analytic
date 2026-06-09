import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';

function rateColor(v: number): string {
  if (v >= 90) return '#22c55e';
  if (v >= 75) return '#84cc16';
  if (v >= 60) return '#f97316';
  return '#ef4444';
}
function starColor(v: number): string {
  if (v >= 4)   return '#22c55e';
  if (v >= 3.5) return '#eab308';
  if (v >= 3)   return '#f97316';
  return '#ef4444';
}

const SC      = MOCK.carriers.scorecard;
const BY_STAR = [...SC].sort((a, b) => a.stars_raw - b.stars_raw);
const BY_RATE = [...SC].sort((a, b) => a.delivery_rate_pct - b.delivery_rate_pct);
const BY_DAYS = SC.filter(c => c.avg_transit_days != null).sort((a, b) => (b.avg_transit_days ?? 0) - (a.avg_transit_days ?? 0));

@Component({
  selector: 'app-carriers',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <h2 class="text-base font-bold text-gray-900 mb-4">Carriers</h2>

    <!-- 4 highlight KPI cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Most Used</p>
        <p class="text-2xl font-bold text-gray-900">{{ mock.carriers.kpis.most_used.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.most_used.shipments.toLocaleString() }} shipments</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Best Delivery Rate</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.carriers.kpis.best_delivery_rate.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.best_delivery_rate.rate_pct }}%</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Fastest</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.carriers.kpis.fastest.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.fastest.avg_transit_days }} days avg.</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Top Rated</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.carriers.kpis.top_rated.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.top_rated.stars_str }}&nbsp;&nbsp;{{ mock.carriers.kpis.top_rated.stars_raw }} / 5</p>
      </div>
    </div>

    <!-- Star rating + Delivery success rate -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Carrier Star Rating</h3>
        <div echarts [options]="starOptions" style="height:340px;"></div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Delivery Success Rate</h3>
        <div echarts [options]="deliveryRateOptions" style="height:340px;"></div>
      </div>
    </div>

    <!-- Avg delivery + EDD on-time -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Average Delivery Time by Carrier</h3>
        <div echarts [options]="avgDaysOptions" style="height:300px;"></div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-1">EDD On-Time or Earlier by Carrier</h3>
        <p class="text-xs text-gray-400 mb-4">% delivered on or before EDD + 1 day · carriers with ≥5 EDD shipments only</p>
        <div echarts [options]="eddOptions" style="height:300px;"></div>
      </div>
    </div>

    <!-- Full Carrier Scorecard table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Full Carrier Scorecard</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th class="text-left px-4 py-3">Carrier</th>
              <th class="text-right px-4 py-3">Shipments</th>
              <th class="text-right px-4 py-3">Delivery Rate</th>
              <th class="text-right px-4 py-3">Exception Rate</th>
              <th class="text-right px-4 py-3">Avg Transit</th>
              <th class="text-right px-4 py-3">EDD On-Time</th>
              <th class="text-center px-4 py-3">Stars</th>
              <th class="px-4 py-3 min-w-[130px]">Score</th>
            </tr>
          </thead>
          <tbody>
            @for (c of mock.carriers.scorecard; track c.carrier) {
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ c.carrier }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ c.shipments.toLocaleString() }}</td>
                <td class="px-4 py-3 text-right">
                  <span [class]="rateBadge(c.delivery_rate_pct)">{{ c.delivery_rate_pct }}%</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span [class]="exBadge(c.exception_rate_pct)">{{ c.exception_rate_pct }}%</span>
                </td>
                <td class="px-4 py-3 text-right text-gray-600">{{ c.avg_transit_days != null ? c.avg_transit_days + 'd' : '—' }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ c.edd_on_time_pct != null ? c.edd_on_time_pct + '%' : '—' }}</td>
                <td class="px-4 py-3 text-center text-amber-400 text-sm leading-none">{{ c.stars_str }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div class="bg-blue-500 h-1.5 rounded-full" [style.width]="c.score * 100 + '%'"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-7 text-right tabular-nums">{{ (c.score * 100).toFixed(0) }}</span>
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
export class CarriersComponent {
  mock = MOCK;

  rateBadge(v: number): string {
    if (v >= 85) return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700';
    if (v >= 70) return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700';
    return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700';
  }
  exBadge(v: number): string {
    if (v <= 10) return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700';
    if (v <= 25) return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700';
    return 'inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700';
  }

  starOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}` },
    grid: { top: 8, right: 48, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 5, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_STAR.map(c => c.carrier), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_STAR.length),
      data: BY_STAR.map(c => ({ value: c.stars_raw, itemStyle: { color: starColor(c.stars_raw), borderRadius: [0, 3, 3, 0] } })),
      label: { show: true, position: 'right', formatter: (p: any) => String(p.value), color: '#6b7280', fontSize: 11 },
    }],
  };

  deliveryRateOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { top: 8, right: 56, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_RATE.map(c => c.carrier), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_RATE.length),
      data: BY_RATE.map(c => ({ value: c.delivery_rate_pct, itemStyle: { color: rateColor(c.delivery_rate_pct), borderRadius: [0, 3, 3, 0] } })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}%`, color: '#6b7280', fontSize: 11 },
    }],
  };

  avgDaysOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}d` },
    grid: { top: 8, right: 48, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_DAYS.map(c => c.carrier), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_DAYS.length),
      data: BY_DAYS.map(c => ({ value: c.avg_transit_days, itemStyle: { color: (c.avg_transit_days ?? 0) <= 2 ? '#22c55e' : (c.avg_transit_days ?? 0) <= 3.5 ? '#84cc16' : '#f97316', borderRadius: [0, 3, 3, 0] } })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}d`, color: '#6b7280', fontSize: 11 },
    }],
  };

  eddOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { top: 8, right: 56, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: ['UPS', 'ACS Courier', 'DHL', 'Nacex'], axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(4),
      data: [
        { value: 91.0,  itemStyle: { color: '#22c55e', borderRadius: [0, 3, 3, 0] } },
        { value: 79.0,  itemStyle: { color: '#84cc16', borderRadius: [0, 3, 3, 0] } },
        { value: 56.0,  itemStyle: { color: '#f97316', borderRadius: [0, 3, 3, 0] } },
        { value: 100.0, itemStyle: { color: '#22c55e', borderRadius: [0, 3, 3, 0] } },
      ],
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}%`, color: '#6b7280', fontSize: 11 },
    }],
  };
}
