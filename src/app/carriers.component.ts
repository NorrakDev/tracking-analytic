import { Component, signal, computed } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MOCK } from './mock.data';
import { dynBarWidth } from './chart.utils';
import { carrierName } from './constants';

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

type SortCol = 'carrier' | 'shipments' | 'delivery_rate_pct' | 'exception_rate_pct'
             | 'avg_transit_days' | 'edd_on_time_pct' | 'stars_raw' | 'score';

const SC      = MOCK.carriers.scorecard;
const BY_STAR = [...SC].sort((a, b) => a.stars_raw - b.stars_raw);
const BY_RATE = [...SC].sort((a, b) => a.delivery_rate_pct - b.delivery_rate_pct);
const BY_DAYS = SC.filter(c => c.avg_transit_days != null)
                  .sort((a, b) => (b.avg_transit_days ?? 0) - (a.avg_transit_days ?? 0));
const BY_EDD  = SC.filter(c => c.edd_on_time_pct != null)
                  .sort((a, b) => (a.edd_on_time_pct ?? 0) - (b.edd_on_time_pct ?? 0));

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
        <p class="text-2xl font-bold text-gray-900">{{ cn(mock.carriers.kpis.most_used.carrier) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.most_used.shipments.toLocaleString() }} shipments</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Best Delivery Rate</p>
        <p class="text-2xl font-bold text-green-600">{{ cn(mock.carriers.kpis.best_delivery_rate.carrier) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.best_delivery_rate.rate_pct }}%</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Fastest</p>
        <p class="text-2xl font-bold text-green-600">{{ cn(mock.carriers.kpis.fastest.carrier) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ mock.carriers.kpis.fastest.avg_transit_days }} days avg.</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1.5">Top Rated</p>
        <p class="text-2xl font-bold text-green-600">{{ cn(mock.carriers.kpis.top_rated.carrier) }}</p>
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
      <!-- Table header row with search -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <h3 class="text-sm font-semibold text-gray-900 shrink-0">Full Carrier Scorecard</h3>
        <div class="relative w-56">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            placeholder="Search carriers…"
            [value]="searchQuery()"
            (input)="searchQuery.set(castInput($event))"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th class="text-left px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('carrier')">
                <span class="flex items-center gap-1">Carrier <span [innerHTML]="sortIcon('carrier')"></span></span>
              </th>
              <th class="text-right px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('shipments')">
                <span class="flex items-center justify-end gap-1">Shipments <span [innerHTML]="sortIcon('shipments')"></span></span>
              </th>
              <th class="text-right px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('delivery_rate_pct')">
                <span class="flex items-center justify-end gap-1">Delivery Rate <span [innerHTML]="sortIcon('delivery_rate_pct')"></span></span>
              </th>
              <th class="text-right px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('exception_rate_pct')">
                <span class="flex items-center justify-end gap-1">Exception Rate <span [innerHTML]="sortIcon('exception_rate_pct')"></span></span>
              </th>
              <th class="text-right px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('avg_transit_days')">
                <span class="flex items-center justify-end gap-1">Avg Transit <span [innerHTML]="sortIcon('avg_transit_days')"></span></span>
              </th>
              <th class="text-right px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('edd_on_time_pct')">
                <span class="flex items-center justify-end gap-1">EDD On-Time <span [innerHTML]="sortIcon('edd_on_time_pct')"></span></span>
              </th>
              <th class="text-center px-4 py-3 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap" (click)="sort('stars_raw')">
                <span class="flex items-center justify-center gap-1">Stars <span [innerHTML]="sortIcon('stars_raw')"></span></span>
              </th>
              <th class="px-4 py-3 cursor-pointer select-none hover:text-gray-700 min-w-[130px] whitespace-nowrap" (click)="sort('score')">
                <span class="flex items-center gap-1">Score <span [innerHTML]="sortIcon('score')"></span></span>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (c of tableRows(); track c.carrier) {
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ cn(c.carrier) }}</td>
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
            @if (tableRows().length === 0) {
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">
                  No carriers match "{{ searchQuery() }}"
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
  cn = carrierName;

  // ── Table state ──────────────────────────────────────────────────
  searchQuery = signal('');
  sortCol     = signal<SortCol>('score');
  sortDir     = signal<'asc' | 'desc'>('desc');

  tableRows = computed(() => {
    const q   = this.searchQuery().toLowerCase().trim();
    const col = this.sortCol();
    const dir = this.sortDir();

    const rows = q
      ? SC.filter(c => carrierName(c.carrier).toLowerCase().includes(q))
      : [...SC];

    return rows.sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      // nulls always sink to the bottom regardless of direction
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return dir === 'asc'
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  });

  sort(col: SortCol) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('desc');
    }
  }

  sortIcon(col: SortCol): string {
    if (this.sortCol() !== col) {
      return `<svg class="w-3 h-3 text-gray-300 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
      </svg>`;
    }
    return this.sortDir() === 'asc'
      ? `<svg class="w-3 h-3 text-blue-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
         </svg>`
      : `<svg class="w-3 h-3 text-blue-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
         </svg>`;
  }

  castInput(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  // ── Badges ───────────────────────────────────────────────────────
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

  // ── Charts ───────────────────────────────────────────────────────
  starOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}` },
    grid: { top: 8, right: 48, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 5, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_STAR.map(c => carrierName(c.carrier)), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
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
    yAxis: { type: 'category', data: BY_RATE.map(c => carrierName(c.carrier)), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
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
    yAxis: { type: 'category', data: BY_DAYS.map(c => carrierName(c.carrier)), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_DAYS.length),
      data: BY_DAYS.map(c => ({
        value: c.avg_transit_days,
        itemStyle: { color: (c.avg_transit_days ?? 0) <= 2 ? '#22c55e' : (c.avg_transit_days ?? 0) <= 3.5 ? '#84cc16' : '#f97316', borderRadius: [0, 3, 3, 0] },
      })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}d`, color: '#6b7280', fontSize: 11 },
    }],
  };

  eddOptions: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { top: 8, right: 56, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: BY_EDD.map(c => carrierName(c.carrier)), axisLabel: { color: '#4b5563', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: dynBarWidth(BY_EDD.length),
      data: BY_EDD.map(c => ({
        value: c.edd_on_time_pct,
        itemStyle: { color: rateColor(c.edd_on_time_pct ?? 0), borderRadius: [0, 3, 3, 0] },
      })),
      label: { show: true, position: 'right', formatter: (p: any) => `${p.value}%`, color: '#6b7280', fontSize: 11 },
    }],
  };
}
