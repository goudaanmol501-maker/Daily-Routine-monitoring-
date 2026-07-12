import { Component, OnInit }                from '@angular/core';
import { NgClass }                          from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { CdkDragDrop, DragDropModule,
         moveItemInArray }                  from '@angular/cdk/drag-drop';
import { TrackerService, Task }             from '../../services/tracker.service';

@Component({
  selector:    'app-tracker',
  standalone:  true,
  imports:     [NgClass, FormsModule, DragDropModule],
  templateUrl: './tracker.html',
  styleUrls:   ['./tracker.css']
})
export class TrackerComponent implements OnInit {

  // ===== STATE =====
  currentYear  = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  dates:  Date[] = [];
  tasks:  Task[] = [];

  // add task form
  newTaskLabel = '';
  newTaskIcon  = '📌';
  showAddForm  = false;

  // available icons to pick from
  iconOptions = [
    '⏰','🏃','💼','🍱','📚','😴','💧','🧘',
    '📝','🎯','💊','🛒','📞','🎵','🏋️','🍎'
  ];

  monthNames = [
    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December'
  ];

  dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  constructor(public trackerService: TrackerService) {}

  ngOnInit() {
    this.tasks = this.trackerService.getTasks();
    this.generateDates();
    this.autoCheckMonth();
  }

  // ===== AUTO MONTH CHECK =====
  // automatically shows current month on load
  autoCheckMonth() {
    const now = new Date();
    this.currentYear  = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.generateDates();
  }

  // ===== DATE GENERATION =====
  generateDates() {
    this.dates = [];
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      this.dates.push(
        new Date(this.currentYear, this.currentMonth, day)
      );
    }
  }

  // ===== NAVIGATION =====
  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateDates();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateDates();
  }

  goToToday() {
    this.autoCheckMonth();
  }

  // ===== DATE HELPERS =====
  isToday(date: Date): boolean {
    const t = new Date();
    return date.getDate()     === t.getDate()  &&
           date.getMonth()    === t.getMonth() &&
           date.getFullYear() === t.getFullYear();
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  }

  isDisabled(date: Date): boolean {
    return this.isPast(date) || this.isFuture(date);
  }

  isSunday(date: Date):   boolean { return date.getDay() === 0; }
  isSaturday(date: Date): boolean { return date.getDay() === 6; }
  isWeekend(date: Date):  boolean { return this.isSunday(date) || this.isSaturday(date); }

  getDayLabel(date: Date): string {
    return this.dayLabels[date.getDay()];
  }

  
  // get display state for a cell
  // returns: 'done-red' | 'done-green' | 'undone' | 'disabled-done' | 'disabled-undone'
  getCellState(date: Date, taskId: string): string {
    const status = this.trackerService.getStatus(date, taskId);

    if (this.isDisabled(date)) {
      // past or future — locked
      return status ? 'disabled-done' : 'disabled-undone';
    }

    if (this.isToday(date)) {
      if (!status) return 'undone';
      // checked today — red if incomplete, green if all done
      return  'done-green';
    }

    return 'undone';
  }

  // ===== CHECKBOX =====
  toggle(date: Date, taskId: string) {
    this.trackerService.toggle(date, taskId);
  }

  getStatus(date: Date, taskId: string): boolean {
    return this.trackerService.getStatus(date, taskId);
  }

  getProgress(date: Date): number {
    return this.trackerService.getDayProgress(date, this.tasks);
  }

  getProgressColor(progress: number): string {
    if (progress >= 90) return 'prog-green';
    if (progress >= 41) return 'prog-yellow';
    return 'prog-red';
  }
  getCellEmoji(state: string): string {
    switch(state) {
      case 'done-green':     return '✅';
      case 'done-red':       return '🔴';
      case 'disabled-done':  return '✅';
      case 'disabled-undone':return '⬜';
      default:               return '⬜';
    }
  }
  // ===== ADD TASK =====
  addTask() {
    const label = this.newTaskLabel.trim();
    if (!label) return;

    const newTask = this.trackerService.addTask(label, this.newTaskIcon);
    this.tasks.push(newTask);

    // reset form
    this.newTaskLabel = '';
    this.newTaskIcon  = '📌';
    this.showAddForm  = false;
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addTask();
  }

  // ===== DELETE TASK =====
  deleteTask(taskId: string) {
    this.trackerService.deleteTask(taskId);
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  // ===== DRAG AND DROP =====
  onDrop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    this.trackerService.reorderTasks(this.tasks);
  }

}