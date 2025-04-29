import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router'; // If you need navigation
import { Time } from 'src/domain/admin-rules';
import { EmployeeAttendanceService } from 'src/service/employee-attendance.service';
import { HttpClient } from '@angular/common/http'; //added
import { environment } from 'src/environments/environment';

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
    setTimeout(() => this.updateCurrentTime(), 1000);
  }

  ngOnInit() {
    this.timeRule = [
      { time: '7:00 AM-6:00 PM' },
      { time: '8:00 AM-5:00 PM' },
      { time: '5:00 pM-6:00 PM' },
    ];
    
    this.loadSavedRules();
  }

  loadSavedRules() {
    this.http.get(`${environment.apiUrl}api/allowed-time`).subscribe({
      next: (response: any) => {
        if (response && response.time && response.pauseTracking !== undefined) {
          this.selectedTimeRule = this.timeRule.find(
            (rule) => rule.time === response.time
          ) || this.timeRule[0];
          this.selectedPauseTracking = this.pauseTracking.find(
            (track) => track.value === response.pauseTracking
          ) || this.pauseTracking[0];
        }
      },
      error: (err) => {
        // Set defaults on error
        this.selectedTimeRule = this.timeRule[0];
        this.selectedPauseTracking = this.pauseTracking[0];
      },
    });

  }

  confirm(): void {
    if (!this.selectedTimeRule?.time || this.selectedPauseTracking?.value === undefined) {
      alert('Please select both time rule and pause tracking option');
      return;
    }
    
    this.attendanceService.setAllowedTime(
      this.selectedTimeRule.time, 
      this.selectedPauseTracking.value
    ).subscribe({
      next: (response: any) => {
        console.log('Success:', response);
        alert(response.message || 'Time rule configured successfully');
        this.loadSavedRules();
      },
      error: (err) => {
        console.error('API error details:', err);
        alert('Failed to configure time rule. Please try again.');
      },
    });
  }
}