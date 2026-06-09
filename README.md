# Tracking Analytics Dashboard

A standalone Angular 17 single-page dashboard for visualising shipment tracking analytics.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone components, signals) |
| Charts | ngx-echarts + ECharts 5 |
| Styling | Tailwind CSS 3 |
| Language | TypeScript |

## Features

- **Overview** — 7 KPI cards, daily shipment volume (weekday/weekend colour coding + rolling 7-day average), active shipments by status
- **Carriers** — highlight KPIs, star rating & delivery success rate charts, average transit time, EDD on-time rate, full carrier scorecard table with score progress bars
- **Geography** — top sending/receiving countries, average delivery time by destination, carrier performance breakdown by destination (dropdown), top shipping routes table
- **Delivery Speed** — transit time histogram with P90 marker, average transit by carrier, deliveries by speed category
- **Issues** — issue rate over time area chart, exception rate by carrier

All horizontal bar chart widths scale dynamically with the number of series via a shared `dynBarWidth` utility.

## Getting Started

```bash
npm install
npm start        # → http://localhost:4200
npm run build    # production build → dist/
```

## Project Structure

```
src/app/
├── mock.data.ts                  # Mock API response (full dataset)
├── chart.utils.ts                # Shared dynBarWidth helper
├── app.component.ts              # Shell: sidebar, header, filter bar, tabs
├── overview.component.ts
├── carriers.component.ts
├── geography.component.ts
├── delivery-speed.component.ts
└── issues.component.ts
```
