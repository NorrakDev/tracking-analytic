# Tracking Analytics Dashboard

A standalone Angular 17 analytics dashboard for Ship24 tracking data.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone components, signals) |
| Charts | ngx-echarts + ECharts 5 |
| Styling | Tailwind CSS 3 |
| Language | TypeScript |

## Features

- **Overview** — 7 KPI cards, daily shipment volume (weekday/weekend bars + rolling avg), active shipments by status
- **Carriers** — highlight KPIs, star rating & delivery success rate charts, avg transit time, EDD on-time, full carrier scorecard table
- **Geography** — top sending/receiving countries, avg delivery by destination, carrier performance by destination (dropdown), top shipping routes table
- **Delivery Speed** — transit time histogram with P90 marker, avg transit by carrier, deliveries by speed category
- **Issues** — issue rate over time area chart, exception rate by carrier

All chart bar widths scale dynamically with the number of series via a shared `dynBarWidth` utility.

## Getting Started

```bash
npm install
npm start        # → http://localhost:4200
npm run build    # production build → dist/
```

## Project Structure

```
src/app/
├── mock.data.ts              # Full mock API response
├── chart.utils.ts            # Shared dynBarWidth helper
├── app.component.ts          # Shell: sidebar, header, filter bar, tabs
├── overview.component.ts
├── carriers.component.ts
├── geography.component.ts
├── delivery-speed.component.ts
└── issues.component.ts
```
