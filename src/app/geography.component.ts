import { Component, signal, computed } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';

function rateColor(v: number): string {
  if (v >= 85) return '#22c55e';
  if (v >= 70) return '#84cc16';
  if (v >= 55) return '#f97316';
  return '#ef4444';
}
function issueColor(v: number): string {
  if (v <= 8)  return '#22c55e';
  if (v <= 12) return '#84cc16';
  if (v <= 32) return '#f97316';
  return '#ef4444';
}
function transitColor(v: number): string {
  if (v <= 1.8) return '#22c55e';
  if (v <= 2.5) return '#84cc16';
  if (v <= 3.5) return '#f97316';
  return '#ef4444';
}

const SEND = [...MOCK.geography.top_origin_countries].reverse();
const RECV = [...MOCK.geography.top_destination_countries].reverse();
const AVG  = MOCK.geography.avg_delivery_time_by_destination;

@Component({
  selector: 'app-geography',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <h2 class="text-base font-bold text-gray-900 mb-1">Geography</h2>
    <p class="text-sm text-gray-500 mb-5">Understanding your key shipping corridors helps plan capacity and spot problem routes.</p>

    <!-- Sending / Receiving -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Top Sending Countries</h3>
        <div echarts [options]="sendingOptions" style="height:240px;"></div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Top Receiving Countries</h3>
        <div echarts [options]="receivingOptions" style="height:240px;"></div>
      </div>
    </div>

    <!-- Avg delivery by destination -->
    <div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Average Delivery Time by Destination</h3>
      <div echarts [options]="avgDestOptions" style="height:240px;"></div>
    </div>

    <!-- Carrier Performance by Destination -->
    <div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Carrier Performance by Destination</h3>
        <select
          class="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          [value]="selectedDest()"
          (change)="selectedDest.set(castEvt($event))"
        >
          @for (k of mock.geography.destination_keys; track k) {
            <option [value]="k">{{ k }} ({{ mock.geography.carrier_performance_by_destination[k]?.country_name }})</option>
          }
        </select>
      </div>
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-xs font-medium text-gray-600 mb-3">Delivery Rate in {{ destName() }}</p>
          <div echarts [options]="destDeliveryOptions()" style="height:120px;"></div>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-600 mb-3">Avg. Transit in {{ destName() }}</p>
          <div echarts [options]="destTransitOptions()" style="height:120px;"></div>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-600 mb-3">Issue Rate in {{ destName() }}</p>
          <div echarts [options]="destIssueOptions()" style="height:120px;"></div>
        </div>
      </div>
    </div>

    <!-- Top Shipping Routes table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Top Shipping Routes</h3>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th class="text-left px-5 py-3">Route</th>
            <th class="text-left px-5 py-3">Shipments</th>
            <th class="text-left px-5 py-3">Delivery Rate</th>
            <th class="text-left px-5 py-3">Issue Rate</th>
            <th class="text-left px-5 py-3">Avg Delivery</th>
          </tr>
        </thead>
        <tbody>
          @for (r of mock.geography.top_routes; track r.route_label) {
            <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <td class="px-5 py-3 font-medium text-gray-900">{{ r.route_label }}</td>
              <td class="px-5 py-3 text-gray-600">{{ r.shipments.toLocaleString() }}</td>
              <td class="px-5 py-3 text-gray-600">{{ r.delivery_rate_pct }}%</td>
              <td class="px-5 py-3 text-gray-600">{{ r.exception_rate_pct }}%</td>
              <td class="px-5 py-3 text-gray-600">{{ r.avg_transit_days }}d</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class GeographyComponent {
  mock = MOCK;
  selectedDest = signal('ES');

  private destEntry = computed(() =>
    MOCK.geography.carrier_performance_by_destination[this.selectedDest()]
  );

  destName = computed(() => this.destEntry()?.country_name ?? this.selectedDest());

  private carriers = computed(() => this.destEntry()?.carriers ?? []);

  castEvt(e: Event) { return (e.target as HTMLSelectElement).value; }

  sendingOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}<br/>shipments : ${p[0].value.toLocaleString()}` },
    grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: SEND.map(d => `${d.country_name} (${d.country_code})`), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: 'bar', data: SEND.map(d => ({ value: d.shipments, itemStyle: { color: '#3b82f6', borderRadius: [0, 3, 3, 0] } })), barMaxWidth: dynBarWidth(SEND.length), label: { show: true, position: 'right', formatter: (p: any) => p.value.toLocaleString(), color: '#6b7280', fontSize: 10 } }],
  };

  receivingOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}<br/>shipments : ${p[0].value.toLocaleString()}` },
    grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: RECV.map(d => `${d.country_name} (${d.country_code})`), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: 'bar', data: RECV.map(d => ({ value: d.shipments, itemStyle: { color: '#8b5cf6', borderRadius: [0, 3, 3, 0] } })), barMaxWidth: dynBarWidth(RECV.length), label: { show: true, position: 'right', formatter: (p: any) => p.value.toLocaleString(), color: '#6b7280', fontSize: 10 } }],
  };

  avgDestOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}d` },
    grid: { top: 8, right: 48, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: AVG.map(d => `${d.country_name} (${d.country_code})`), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: 'bar', data: AVG.map(d => ({ value: d.avg_transit_days, itemStyle: { color: transitColor(d.avg_transit_days), borderRadius: [0, 3, 3, 0] } })), barMaxWidth: dynBarWidth(AVG.length), label: { show: true, position: 'right', formatter: (p: any) => `${p.value}d`, color: '#6b7280', fontSize: 11 } }],
  };

  private barOpts(data: any[], valueKey: string, colorFn: (v: number) => string, fmt: (v: number) => string): EChartsOption {
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 4, right: 50, bottom: 4, left: 4, containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 9 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      yAxis: { type: 'category', data: data.map((r: any) => r.carrier), axisLabel: { color: '#4b5563', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', barMaxWidth: dynBarWidth(data.length), data: data.map((r: any) => ({ value: r[valueKey], itemStyle: { color: colorFn(r[valueKey]), borderRadius: [0, 3, 3, 0] } })), label: { show: true, position: 'right', formatter: (p: any) => fmt(p.value), color: '#6b7280', fontSize: 10 } }],
    };
  }

  destDeliveryOptions = computed<EChartsOption>(() =>
    this.barOpts(this.carriers(), 'delivery_rate_pct', rateColor, v => `${v}%`)
  );
  destTransitOptions = computed<EChartsOption>(() =>
    this.barOpts(this.carriers(), 'avg_transit_days', () => '#22c55e', v => `${v}d`)
  );
  destIssueOptions = computed<EChartsOption>(() =>
    this.barOpts(this.carriers(), 'exception_rate_pct', issueColor, v => `${v}%`)
  );
}
