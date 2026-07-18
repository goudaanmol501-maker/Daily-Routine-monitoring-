import { Component, OnInit } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { TrackerService }    from '../../services/tracker.service';

@Component({
  selector:    'app-sleep-chart',
  standalone:  true,
  imports:     [FormsModule],
  templateUrl: './sleep-chart.html',
  styleUrls:   ['./sleep-chart.css']
})
export class SleepChartComponent implements OnInit {

  todayLabel   = '';
  savedToday   = false;
  avgSleep     = 0;

  // ===== 4 INPUTS =====
  mood         = '';
  sleptTime    = '23:00';   // default 11 PM
  wakeupTime   = '07:00';   // default 7 AM
  minsToSleep  = 15;        // default 15 mins

  // calculated
  calculatedHours = 0;

  // mood options
  moods = [
    { emoji: '😴', label: 'TERRIBLE', value: 'terrible' },
    { emoji: '😐', label: 'OKAY',     value: 'okay'     },
    { emoji: '😊', label: 'GOOD',     value: 'good'     },
    { emoji: '🤩', label: 'EXCELLENT',value: 'excellent' },
  ];

  // chart data
  chartData: {
    label: string;
    hours: number;
    color: string;
    height: string;
  }[] = [];

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    const today     = new Date();
    this.todayLabel = today.toLocaleDateString('en-GB', {
      weekday: 'long', day: '2-digit', month: 'short'
    });

    // load today's saved detail if exists
    const saved = this.trackerService.getSleepDetail(today);
    if (saved) {
      this.mood          = saved.mood;
      this.sleptTime     = saved.sleptTime;
      this.wakeupTime    = saved.wakeupTime;
      this.minsToSleep   = saved.minsToSleep;
      this.calculatedHours = saved.actualHours;
      this.savedToday    = true;
    }

    this.calculateSleep();
    this.refreshChart();
  }

  // ===== CALCULATE SLEEP HOURS =====
  calculateSleep() {
    if (!this.sleptTime || !this.wakeupTime) return;

    const [sh, sm] = this.sleptTime.split(':').map(Number);
    const [wh, wm] = this.wakeupTime.split(':').map(Number);

    // convert to minutes from midnight
    let sleptMins  = sh * 60 + sm;
    let wakeMins   = wh * 60 + wm;

    // if woke up "before" sleep time → add 24 hrs (slept past midnight)
    if (wakeMins <= sleptMins) {
      wakeMins += 24 * 60;
    }

    // total time in bed minus time to fall asleep
    const totalMins    = wakeMins - sleptMins - this.minsToSleep;
    this.calculatedHours = Math.max(0,
      Math.round((totalMins / 60) * 10) / 10
    );
  }

  // ===== SAVE =====
  save() {
    this.calculateSleep();

    if (!this.mood) {
      alert('Please select your wake-up mood!');
      return;
    }

    const today = new Date();
    this.trackerService.saveSleepDetail(today, {
      mood:         this.mood,
      sleptTime:    this.sleptTime,
      wakeupTime:   this.wakeupTime,
      minsToSleep:  this.minsToSleep,
      actualHours:  this.calculatedHours
    });

    this.savedToday = true;
    this.refreshChart();
  }

  // ===== CHART DATA =====
  refreshChart() {
    const data    = this.trackerService.getLast7DaysSleep();
    const nonZero = data.filter(d => d.hours > 0);
    this.avgSleep = nonZero.length
      ? Math.round(
          (nonZero.reduce((a, b) => a + b.hours, 0) / nonZero.length) * 10
        ) / 10
      : 0;

    this.chartData = data.map(d => ({
      label:  d.label,
      hours:  d.hours,
      color:  this.getBarColor(d.hours),
      height: this.getBarHeight(d.hours)
    }));
  }

  // ===== HELPERS =====
  getBarColor(hours: number): string {
    if (hours >= 7)  return '#4ade80';
    if (hours >= 5)  return '#facc15';
    if (hours > 0)   return '#f87171';
    return '#2d3748';
  }

  getBarHeight(hours: number): string {
    if (hours <= 0) return '4px';
    return Math.min(100, Math.max(8, hours * 10)) + '%';
  }

  getSleepQualityColor(hours: number): string {
    if (hours >= 7)  return '#4ade80';
    if (hours >= 5)  return '#facc15';
    if (hours > 0)   return '#f87171';
    return '#374151';
  }

  getSleepQualityLabel(hours: number): string {
    if (hours >= 8)  return 'EXCELLENT';
    if (hours >= 7)  return 'GOOD';
    if (hours >= 5)  return 'AVERAGE';
    if (hours > 0)   return 'POOR';
    return '--';
  }

  getMoodEmoji(value: string): string {
    return this.moods.find(m => m.value === value)?.emoji || '❓';
  }

  // mins to sleep +/-
  decreaseMins() {
    this.minsToSleep = Math.max(0, this.minsToSleep - 5);
    this.calculateSleep();
  }

  increaseMins() {
    this.minsToSleep = Math.min(120, this.minsToSleep + 5);
    this.calculateSleep();
  }

  onTimeChange() {
    this.calculateSleep();
  }

  showTooltip(event: MouseEvent, item: any) {
    const target  = event.currentTarget as HTMLElement;
    const tooltip = target.previousElementSibling as HTMLElement;
    if (tooltip) tooltip.style.opacity = '1';
  }

  hideTooltip(event: MouseEvent) {
    const target  = event.currentTarget as HTMLElement;
    const tooltip = target.previousElementSibling as HTMLElement;
    if (tooltip) tooltip.style.opacity = '0';
  }
}