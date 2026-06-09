import { Component, signal } from '@angular/core';
import { OverviewComponent }      from './overview.component';
import { CarriersComponent }      from './carriers.component';
import { GeographyComponent }     from './geography.component';
import { DeliverySpeedComponent } from './delivery-speed.component';
import { IssuesComponent }        from './issues.component';

type TabId = 'overview' | 'carriers' | 'geography' | 'delivery-speed' | 'issues';
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',        label: 'Overview'       },
  { id: 'carriers',        label: 'Carriers'       },
  { id: 'geography',       label: 'Geography'      },
  { id: 'delivery-speed',  label: 'Delivery Speed' },
  { id: 'issues',          label: 'Issues'         },
];

const NAV_ICONS = [
  { title: 'Dashboard',             active: false, path: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z' },
  { title: 'Shipments',             active: false, path: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { title: 'Branded Tracking Page', active: false, path: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-1.66 2.4-2.5 4.8-2.5 7.5S10.34 16.6 12 19m0-17c1.66 2.4 2.5 4.8 2.5 7.5S13.66 16.6 12 19M2 12h20' },
  { title: 'Notifications',         active: false, path: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  { title: 'Tracking Analytics',    active: true,  path: 'M3 3v16a2 2 0 002 2h16M18 17V9M13 17V5M8 17v-3' },
  { title: 'Subscriptions',         active: false, path: 'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM1 10h22' },
  { title: 'Billing & Invoice',     active: false, path: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { title: 'Manage Account',        active: false, path: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
  { title: 'Knowledge Base',        active: false, path: 'M12 7v14M3 18a1 1 0 01-1-1V4a1 1 0 011-1h5a4 4 0 014 4 4 4 0 014-4h5a1 1 0 011 1v13a1 1 0 01-1 1h-6a3 3 0 00-3 3 3 3 0 00-3-3z' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverviewComponent, CarriersComponent, GeographyComponent, DeliverySpeedComponent, IssuesComponent],
  template: `
    <div class="flex min-h-screen bg-white">

      <!-- ── Sidebar ── -->
      <aside class="fixed left-0 top-0 h-full w-10 bg-white border-r border-gray-200 flex flex-col items-center py-3 z-50 gap-1">
        @for (nav of navIcons; track nav.title) {
          <div
            class="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            [class.text-blue-500]="nav.active"
            [class.bg-blue-50]="nav.active"
            [class.text-gray-400]="!nav.active"
            [class.hover:bg-gray-50]="!nav.active"
            [title]="nav.title"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="nav.path"/>
            </svg>
          </div>
        }
      </aside>

      <!-- ── Main ── -->
      <div class="ml-10 flex-1 flex flex-col min-w-0">

        <!-- Top accent bar -->
        <div class="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-blue-600 shrink-0"></div>

        <!-- Header -->
        <header class="bg-white border-b border-gray-200 h-12 flex items-center justify-between px-6 shrink-0">
          <span class="text-xl font-bold text-blue-500">សុីប២៤ 📊</span>
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 px-8 pt-5 pb-10 overflow-auto">

          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <span class="cursor-pointer hover:text-blue-500">Dashboard</span>
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
            <span class="text-gray-700 font-medium">Tracking Analytics</span>
          </nav>

          <h1 class="text-2xl font-bold text-gray-900 mb-0.5">Tracking Analytics</h1>
          <p class="text-sm text-gray-500 mb-5">Jan 6 – Feb 4, 2026</p>

          <!-- Filter bar -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 mb-5 flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1.5 text-sm cursor-pointer">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-gray-700">Jan 6, 2026 – Feb 4, 2026</span>
            </div>
            <div class="h-5 w-px bg-gray-300"></div>
            <div class="flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded px-2 py-1 hover:border-gray-400">
              <span class="text-gray-500">Carrier:</span>
              <span class="text-gray-700">All carriers</span>
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div class="flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded px-2 py-1 hover:border-gray-400">
              <span class="text-gray-500">Origin:</span>
              <span class="text-gray-700">All origins</span>
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div class="flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded px-2 py-1 hover:border-gray-400">
              <span class="text-gray-500">Destination:</span>
              <span class="text-gray-700">All destinations</span>
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <button class="ml-auto text-sm text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-50 rounded">Reset Filters</button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex gap-6">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  class="py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
                  [class.border-blue-500]="activeTab() === tab.id"
                  [class.text-blue-600]="activeTab() === tab.id"
                  [class.border-transparent]="activeTab() !== tab.id"
                  [class.text-gray-500]="activeTab() !== tab.id"
                >{{ tab.label }}</button>
              }
            </nav>
          </div>

          <!-- Tab content -->
          @switch (activeTab()) {
            @case ('overview')       { <app-overview />       }
            @case ('carriers')       { <app-carriers />       }
            @case ('geography')      { <app-geography />      }
            @case ('delivery-speed') { <app-delivery-speed /> }
            @case ('issues')         { <app-issues />         }
          }

        </main>
      </div>
    </div>
  `,
})
export class AppComponent {
  tabs = TABS;
  navIcons = NAV_ICONS;
  activeTab = signal<TabId>('overview');
}
