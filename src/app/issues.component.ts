import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';

const ISS = MOCK.issues;
const BY_CARRIER_ASC = [...ISS.exception_rate_by_carrier].reverse();

function issueColor(v: number): string {
  if (v <= 8)  return '#22c55e';
  if (v <= 12) return '#84cc16';
  if (v <= 25) return '#f97316';
  if (v <= 35) return '#f97316';
  return '#ef4444';
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <h2 class="text-base font-bold text-gray-900 mb-1">Issues</h2>
    <p class="text-sm text-gray-500 mb-5">An issue (exception) means the shipment ended with a final problem: returned to sender, lost, or otherwise undeliverable. Only resolved shipments are counted.</p>

    <!-- 3 KPI cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Overall Issue Rate</p>
        <p class="text-2xl font-bold text-red-500">{{ mock.issues.kpis.overall_issue_rate_pct }}%</p>
        <div class="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <svg class="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
          </svg>
          {{ mock.issues.kpis.affected_shipments.toLocaleString() }} affected shipments
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Carrier with Fewest Issues</p>
        <p class="text-2xl font-bold text-green-600">{{ mock.issues.kpis.carrier_fewest_issues.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.issues.kpis.carrier_fewest_issues.exception_rate_pct }}% issue rate</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Carrier with Most Issues</p>
        <p class="text-2xl font-bold text-red-500">{{ mock.issues.kpis.carrier_most_issues.carrier }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.issues.kpis.carrier_most_issues.exception_rate_pct }}% issue rate</p>
      </div>
    </div>

    <!-- Issue rate over time + by carrier -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Issue Rate Over Time (%)</h3>
        <div echarts [options]="rateOverTimeOptions" style="height:300px;"></div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Exception Rate by Carrier</h3>
        <div echarts [options]="byCarrierOptions" style="height:300px;"></div>
      </div>
    </div>
  `,
})
export class IssuesComponent {
  mock = MOCK;

  rateOverTimeOptions: EChartsOption = {
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { top: 16, right: 16, bottom: 32, left: 44 },
    xAxis: {
      type: 'category',
      data: ISS.issue_rate_over_time.map(d => fmtDate(d.date)),
      axisLabel: { color: '#9ca3af', fontSize: 10, interval: 4 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0, max: 40,
      axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [{
      type: 'line',
      data: ISS.issue_rate_over_time.map(d => d.issue_rate_pct),
      smooth: 0.4,
      symbol: 'none',
      lineStyle: { color: '#ef4444', width: 1.5 },
      itemStyle: { color: '#ef4444' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(239,68,68,0.22)' },
            { offset: 1, color: 'rgba(239,68,68,0.02)' },
          ],
        },
      },
    }],
  };

  byCarrierOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { top: 8, right: 56, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 45, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_CARRIER_ASC.map(c => c.carrier), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_CARRIER_ASC.length),
      data: BY_CARRIER_ASC.map(c => ({ value: c.exception_rate_pct, itemStyle: { color: issueColor(c.exception_rate_pct), borderRadius: [0, 3, 3, 0] } })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}%`, color: '#6b7280', fontSize: 11 },
    }],
  };
}
