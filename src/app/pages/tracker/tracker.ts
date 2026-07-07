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

  isSunday(date: Date):   boolean { return date.getDay() === 0; }
  isSaturday(date: Date): boolean { return date.getDay() === 6; }
  isWeekend(date: Date):  boolean { return this.isSunday(date) || this.isSaturday(date); }

  getDayLabel(date: Date): string {
    return this.dayLabels[date.getDay()];
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

  // ===== PROGRESS COLOR =====
  getProgressColor(progress: number): string {
    if (progress === 100) return 'bg-green-400';
    if (progress >= 66)   return 'bg-blue-400';
    if (progress >= 33)   return 'bg-yellow-400';
    return 'bg-red-400';
  }
}