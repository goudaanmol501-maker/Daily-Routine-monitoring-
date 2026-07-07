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
}