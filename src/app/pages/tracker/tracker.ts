import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, DatePipe } from '@angular/common';
import { TrackerService, Task } from '../../services/tracker.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [NgFor, NgClass, DatePipe],
  templateUrl: './tracker.html',
  styleUrls: ['./tracker.css']
})
export class TrackerComponent implements OnInit {

  // current year and month being viewed
  currentYear  = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec

  // all dates in the current month
  dates: Date[] = [];

  // your tasks from service
  tasks: Task[] = [];

  // month names for header display
  monthNames = [
    'January', 'February', 'March',     'April',
    'May',     'June',     'July',      'August',
    'September','October', 'November',  'December'
  ];

  // day labels for each date column
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(public trackerService: TrackerService) {}

  ngOnInit() {
    this.tasks = this.trackerService.tasks;
    this.generateDates();
  }

  // generates all dates for the current month
  generateDates() {
    this.dates = [];
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0                          // day 0 of next month = last day of this month
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      this.dates.push(new Date(this.currentYear, this.currentMonth, day));
    }
  }

  // navigate to previous month
  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateDates();
  }

  // navigate to next month
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateDates();
  }

  // go back to today's month
  goToToday() {
    this.currentYear  = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.generateDates();
  }

  // check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate()     === today.getDate()  &&
           date.getMonth()    === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // check if date is Sunday or Saturday
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  // get day name for a date
  getDayName(date: Date): string {
    return this.dayNames[date.getDay()];
  }

  // toggle a cell
  toggle(date: Date, taskId: string) {
    this.trackerService.toggle(date, taskId);
  }

  // get status of a cell
  getStatus(date: Date, taskId: string): boolean {
    return this.trackerService.getStatus(date, taskId);
  }

  // get progress for a day
  getProgress(date: Date): number {
    return this.trackerService.getDayProgress(date);
  }
}