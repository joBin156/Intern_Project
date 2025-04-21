import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from 'src/service/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Fetch notifications when the component loads
    this.notificationService.getNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }

  // Add a notification (for testing purposes or admin actions)
  addNotification(): void {
    const newNotification: Notification = {
      id: 0, // Backend will likely generate this
      message: 'A new notification!',
      timestamp: new Date().toISOString(),
      avatar: 'NN',
      type: 'info',
    };

    this.notificationService.addNotification(newNotification).subscribe((notification) => {
      this.notifications.push(notification);
    });
  }

  // Remove a specific notification
  removeNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    });
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notificationService.clearNotifications().subscribe(() => {
      this.notifications = [];
    });
  }
}
