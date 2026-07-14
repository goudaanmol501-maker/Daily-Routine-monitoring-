import { Component, OnInit, ViewChild,
         ElementRef, Input, OnChanges } from '@angular/core';
import { TrackerService, Task }         from '../../services/tracker.service';

declare var ApexCharts: any;

@Component({
  selector:    'app-chart',
  standalone:  true,
  imports:     [],
  templateUrl: './chart.html',
  styleUrls:   ['./chart.css']
})
export class ChartComponent implements OnInit, OnChanges {

  @ViewChild('chartEl', { static: true }) chartEl!: ElementRef;
  @Input() tasks: Task[] = [];

  chart:       any    = null;
  selectedRange       = 7;     // default last 7 days
  avgPercent          = 0;
  trend               = 0;     // positive = up, negative = down
  showDropdown        = false;

  rangeOptions = [
    { label: 'Last 7 days',  value: 7  },
    { label: 'Last 14 days', value: 14 },
    { label: 'Last 30 days', value: 30 },
    { label: 'This month',   value: -1 }, // special case
  ];

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    this.loadApexCharts().then(() => {
      this.buildChart();
    });
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  // dynamically load ApexCharts from CDN
  loadApexCharts(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof ApexCharts !== 'undefined') {
        resolve();
        return;
      }
      const script    = document.createElement('script');
      script.src      = 'https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js';
      script.onload   = () => resolve();
      document.head.appendChild(script);
    });
  }

  // get dates for selected range
  getDates(): Date[] {
    const dates: Date[] = [];
    const today         = new Date();

    if (this.selectedRange === -1) {
      // this month
      const daysInMonth = new Date(
        today.getFullYear(), today.getMonth() + 1, 0
      ).getDate();

      for (let d = 1; d <= today.getDate(); d++) {
        dates.push(new Date(today.getFullYear(), today.getMonth(), d));
      }
    } else {
      // last N days
      for (let i = this.selectedRange - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d);
      }
    }
    return dates;
  }

  // get progress % for each date
  getProgressData(): { dates: string[], values: number[] } {
    const dates  = this.getDates();
    const labels = dates.map(d =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    );
    const values = dates.map(d =>
      this.trackerService.getDayProgress(d, this.tasks)
    );

    // calculate average
    const total    = values.reduce((a, b) => a + b, 0);
    this.avgPercent = values.length
      ? Math.round(total / values.length) : 0;

    // calculate trend (today vs 7 days ago)
    if (values.length >= 2) {
      this.trend = values[values.length - 1] - values[0];
    }

    return { dates: labels, values };
  }

  // build chart for first time
  buildChart() {
    const { dates, values } = this.getProgressData();

    const options = {
      chart: {
        type:       'area',
        height:     220,
        toolbar:    { show: false },
        background: 'transparent',
        animations: {
          enabled: true,
          speed:   800,
          animateGradually: { enabled: true, delay: 100 }
        }
      },

      series: [{
        name: 'Completion %',
        data: values
      }],

      xaxis: {
        categories: dates,
        labels: {
          style: {
            colors:   '#6b7280',
            fontSize: '10px',
            fontFamily: 'Courier New'
          }
        },
        axisBorder: { color: '#1f2937' },
        axisTicks:  { color: '#1f2937' }
      },

      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => val + '%',
          style: {
            colors:   '#6b7280',
            fontSize: '10px',
            fontFamily: 'Courier New'
          }
        }
      },

      fill: {
        type:     'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom:    0.5,
          opacityTo:      0.05,
          stops:          [0, 90, 100],
          colorStops: [{
            offset:  0,
            color:   '#1bbcd8',
            opacity: 0.5
          }, {
            offset:  100,
            color:   '#1bbcd8',
            opacity: 0.02
          }]
        }
      },

      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#1bbcd8']
      },

      markers: {
        size:        4,
        colors:      ['#1bbcd8'],
        strokeColors:'#030712',
        strokeWidth: 2,
        hover:       { size: 6 }
      },

      tooltip: {
        theme: 'dark',
        style: {
          fontSize:   '12px',
          fontFamily: 'Courier New'
        },
        y: {
          formatter: (val: number) => val + '% complete'
        }
      },

      grid: {
        borderColor: '#1f2937',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true  } },
        padding: { top: 0, right: 10, bottom: 0, left: 10 }
      },

      dataLabels: { enabled: false },

      theme: { mode: 'dark' },

      // color zones
      // red below 40, yellow 40-89, green 90+
      annotations: {
        yaxis: [
          {
            y:           40,
            borderColor: '#f87171',
            borderWidth: 1,
            strokeDashArray: 4,
            label: {
              text:  '40%',
              style: { color: '#f87171', background: 'transparent',
                       fontSize: '9px', fontFamily: 'Courier New' }
            }
          },
          {
            y:           90,
            borderColor: '#4ade80',
            borderWidth: 1,
            strokeDashArray: 4,
            label: {
              text:  '90%',
              style: { color: '#4ade80', background: 'transparent',
                       fontSize: '9px', fontFamily: 'Courier New' }
            }
          }
        ]
      }
    };

    this.chart = new ApexCharts(this.chartEl.nativeElement, options);
    this.chart.render();
  }

  // update chart when range changes
  updateChart() {
    const { dates, values } = this.getProgressData();
    this.chart.updateOptions({
      series:     [{ name: 'Completion %', data: values }],
      xaxis:      { categories: dates }
    });
  }

  // change range from dropdown
  selectRange(value: number, label: string) {
    this.selectedRange  = value;
    this.showDropdown   = false;
    this.updateChart();
  }

  // get trend label
  getTrendLabel(): string {
    if (this.trend > 0) return '↑ ' + this.trend + '%';
    if (this.trend < 0) return '↓ ' + Math.abs(this.trend) + '%';
    return '→ 0%';
  }

  getTrendColor(): string {
    if (this.trend > 0) return '#4ade80';
    if (this.trend < 0) return '#f87171';
    return '#6b7280';
  }

  getRangeLabel(): string {
    return this.rangeOptions.find(r =>
      r.value === this.selectedRange
    )?.label || 'Last 7 days';
  }
}