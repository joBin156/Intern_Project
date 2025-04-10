import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a Notification interface for type safety
export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  avatar: string; // URL or initials for the avatar
  type: string;   // For example: 'info', 'warning', 'error'
}

@Injectable({
  providedIn: 'root', 
})
export class NotificationService {
  private apiUrl = 'localhost:80/';

  constructor(private http: HttpClient) {}

  // Fetch notifications from the backend
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  // Add a new notification
  addNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  // Delete a notification
  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Clear all notifications
  clearNotifications(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }
}
