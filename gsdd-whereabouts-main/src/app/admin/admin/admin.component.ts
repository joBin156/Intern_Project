import { Component, OnInit } from '@angular/core';
import { EmployeeAttendanceService } from 'src/service/employee-attendance.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  basicData: any;
  basicOptions: any;

  constructor(private employeeAttendanceService: EmployeeAttendanceService) {}

  ngOnInit(): void {
    this.setChartOptions();
    this.fetchWeeklyAttendance();
  }

  setChartOptions() {
    this.basicOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Weekly Total Employee Attendance',
          fontSize: 16,
        },
      },
    };
  }

  fetchWeeklyAttendance() {
    this.employeeAttendanceService.().subscribe((User_Id) => {
      const weeklyTotals = this.calculateWeeklyTotals(User_Id);

      this.basicData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
          {
            label: 'Present',
            backgroundColor: '#42A5F5',
            data: weeklyTotals.present,
          },
          {
            label: 'Absent',
            backgroundColor: '#9CCC65',
            data: weeklyTotals.absent,
          },
        ],
      };
    });
  }

  calculateWeeklyTotals(attendance: any[]) {
    const weeklyTotals = {
      present: [0, 0, 0, 0, 0], // Monday to Friday
      absent: [0, 0, 0, 0, 0],  // Monday to Friday
    };

    attendance.forEach((record) => {
      if (record.time_in) {
        const dayOfWeek = new Date(record.time_in).getDay();
        const isPresent = record.time_out !== null;

        // Map days: 0 = Sunday, ..., 6 = Saturday -> Adjust for Monday to Friday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const index = dayOfWeek - 1; // Monday is index 0
          if (isPresent) {
            weeklyTotals.present[index]++;
          } else {
            weeklyTotals.absent[index]++;
          }
        }
      }
    });

    return weeklyTotals;
  }
}
