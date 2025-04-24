import { Component, OnInit } from '@angular/core';
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
  pauseTracking = [
    { label: 'Start', value: true },
    { label: 'Pause', value: false },
  ];
  selectedPauseTracking!: { label: string; value: boolean };

  constructor(
    private attendanceService: EmployeeAttendanceService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.timeRule = [
      { time: '7:00 AM-6:00 PM' },
      { time: '8:00 AM-5:00 PM' },
      { time: '9:00 AM-6:00 PM' },
    ];
  }

  confirm(): void {
    const payload = {
      time: this.selectedTimeRule?.time,
      pauseTracking: this.selectedPauseTracking?.value,
    };
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