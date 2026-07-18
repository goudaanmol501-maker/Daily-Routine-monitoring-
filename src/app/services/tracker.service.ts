import { Injectable } from '@angular/core';

export interface Task {
  id:    string;
  label: string;
  icon:  string;
}

@Injectable({ providedIn: 'root' })
export class TrackerService {

  private tasksKey = 'routine_tasks';

  // default tasks
  private defaultTasks: Task[] = [
    { id: 'wakeUp',   label: 'Wake Up 6:30', icon: '⏰' },
    { id: 'exercise', label: 'Exercise',      icon: '🏃' },
    { id: 'office',   label: 'Office 8:30',  icon: '💼' },
    { id: 'lunch',    label: 'Lunch',         icon: '🍱' },
    { id: 'study',    label: 'Study',         icon: '📚' },
    { id: 'sleep',    label: 'Sleep Time',    icon: '😴' },
  ];

  // ===== TASKS =====

  // get tasks from localStorage or use defaults
  getTasks(): Task[] {
    const stored = localStorage.getItem(this.tasksKey);
    return stored ? JSON.parse(stored) : this.defaultTasks;
  }

  // save tasks order/list to localStorage
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
  }

  // add new task
  addTask(label: string, icon: string): Task {
    const tasks  = this.getTasks();
    const newTask: Task = {
      id:    'task_' + Date.now(),  // unique id using timestamp
      label,
      icon
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  // delete a task
  deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    this.saveTasks(tasks);
  }

  // save reordered tasks after drag and drop
  reorderTasks(tasks: Task[]): void {
    this.saveTasks(tasks);
  }

  // ===== CHECKBOX STATUS =====

  private buildKey(date: Date, taskId: string): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}_${taskId}`;
  }

  getStatus(date: Date, taskId: string): boolean {
    return localStorage.getItem(this.buildKey(date, taskId)) === 'true';
  }

  toggle(date: Date, taskId: string): void {
    const key     = this.buildKey(date, taskId);
    const current = this.getStatus(date, taskId);
    localStorage.setItem(key, String(!current));
  }

  getDayProgress(date: Date, tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => this.getStatus(date, t.id)).length;
    return Math.round((done / tasks.length) * 100);
  }
// ===== SLEEP TRACKING =====
private sleepKey = 'routine_sleep';

// save sleep hours for today

saveSleep(date: Date, hours: number): void{
  const key = this.buildSleepKey(date);
  localStorage.setItem(key, String(hours));
}

getSleep(date: Date): number{
  const key =this.buildSleepKey(date);
  const val = localStorage.getItem(key);
  return val ? parseFloat(val) : 0;
}

// build key for sleep tracking
private buildSleepKey(date: Date): string{
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}_sleep`;
}


// get last 7 days sleep data
getLast7DaysSleep(): { label: string; hours: number; date: Date }[] {
  const result = [];
  const today  = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      date:  d,
      label: d.toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'numeric'
      }),
      hours: this.getSleep(d)
    });
  }
  return result;
}

// ===== SLEEP DETAILS =====
private sleepDetailKey = 'routine_sleep_detail';

saveSleepDetail(date: Date, detail: {
  mood:          string;
  sleptTime:     string;
  wakeupTime:    string;
  minsToSleep:   number;
  actualHours:   number;
}): void {
  const key = `sleep_detail_${this.buildDateKey(date)}`;
  localStorage.setItem(key, JSON.stringify(detail));

  // also save to regular sleep key for graph
  this.saveSleep(date, detail.actualHours);
}

getSleepDetail(date: Date): any {
  const key  = `sleep_detail_${this.buildDateKey(date)}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

private buildDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
}