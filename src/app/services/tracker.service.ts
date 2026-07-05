import { Injectable } from '@angular/core';

export interface Task{
  id: string;
  label: string;
  icon: string;
}
@Injectable({
  providedIn: 'root',
})
export class TrackerService {

  tasks: Task[] = [
    { id: 'wakeUP', label: 'Wake Up 6.30' ,icon: '⏰' },
    { id: 'exercise', label: 'Exercise',      icon: '🏃' },
    { id: 'office',   label: 'Office 8:30',  icon: '💼' },
    { id: 'lunch',    label: 'Lunch',         icon: '🍱' },
    { id: 'study',    label: 'Study',         icon: '📚' },
    { id: 'sleep',    label: 'Sleep Time 12.30',    icon: '😴' },
  ];

  private buildKey(date: Date, taskId: string): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}-${taskId}`;
  }
  
  getStatus(date: Date, taskId: string): boolean {
    const key = this.buildKey(date, taskId);
    return localStorage.getItem(key) === 'true';
  }

  toggle(date: Date, taskId: string): void {
    const key = this.buildKey(date, taskId);
    const currentStatus = this.getStatus(date, taskId);
    localStorage.setItem(key, (!currentStatus).toString());
  }

  getDayProgress(date: Date): number {
    const done = this.tasks.filter(t =>
      this.getStatus(date, t.id)
    ).length;
    return Math.round((done / this.tasks.length) * 100);
  }
}
