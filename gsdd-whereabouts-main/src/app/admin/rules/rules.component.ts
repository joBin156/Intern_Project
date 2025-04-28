import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router'; // If you need navigation
import { Time } from 'src/domain/admin-rules';
import { EmployeeAttendanceService } from 'src/service/employee-attendance.service';
import { HttpClient } from '@angular/common/http'; //added

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
})

export class RulesComponent implements OnInit {
  timeRule!: Time[];
  selectedTimeRule!: Time;
  currentTime: string = '';
  timeIn: string = '--';
  timeOut: string = '--';
  isTimedIn: boolean = false;
  currentDate: string = new Date().toLocaleTimeString();
  pauseTracking = [
    { label: 'Start', value: true },
    { label: 'Pause', value: false },
  ];
  selectedPauseTracking!: { label: string; value: boolean };

  constructor(
    private attendanceService: EmployeeAttendanceService,
    private http: HttpClient
  ) {}

  //added
  updateCurrentTime() {
    const now = new Date();
    this.currentTime = formatDate(now, 'HH:mm:ss', 'en-US');
    setTimeout(() => this.updateCurrentTime(), 1000); // Update time every second
  }
  
  toggleTime() {
    if (this.isTimedIn) {
      this.timeOut = this.currentTime; // Set the time-out when the user "times out"
      this.isTimedIn = false;  // Mark the user as "timed out"
      console.log('Timed out at:', this.timeOut);
    } else {
      this.timeIn = this.currentTime; // Set the time-in when the user "times in"
      this.isTimedIn = true;  // Mark the user as "timed in"
      console.log('Timed in at:', this.timeIn);
    }
  }

  ngOnInit() {
    this.timeRule = [
      { time: '7:00 AM-6:00 PM' },
      { time: '8:00 AM-5:00 PM' },
      { time: '5:00 pM-6:00 PM' },
    ];
    
    //added
    this.http.get('http://localhost:80/allowed-time').subscribe({
      next: (response: any) => {
        if (response && response.time && response.pauseTracking !== undefined) {
          this.selectedTimeRule = this.timeRule.find(
            (rule) => rule.time === response.time
          )!;
          this.selectedPauseTracking = this.pauseTracking.find(
            (track) => track.value === response.pauseTracking
          )!;
        }
      },
      error: (err) => {
        console.error('Failed to fetch saved data:', err);
      },
    });

  }

  confirm(): void {
    const payload = {
      time: this.selectedTimeRule?.time,
      pauseTracking: this.selectedPauseTracking?.value,
    };//added
    this.http.post('http://localhost:80/allowed-time', payload).subscribe({
      next: (response: any) => {
        console.log('Success:', response);
        alert(response.message || 'Time rule configured successfully');
      },
      error: (err) => {
        console.error('API error details:', err);
        alert('Failed to configure time rule. Please try again.');
      },
    });
  }
}