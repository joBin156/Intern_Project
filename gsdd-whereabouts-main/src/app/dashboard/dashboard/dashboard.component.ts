import { Component, OnInit } from '@angular/core';
import { TimeInOutService } from 'src/service/time-in-out.service';
import { EmployeeAttendanceService } from 'src/service/employee-attendance.service';
import { EmployeeAttendance } from 'src/domain/employee-attendance';
import * as XLSX from 'xlsx'; // To generate Excel files

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  totalTimeToday: string = 'Not configured';
  frequentStatus: string = 'Not configured';
  longestStreak: string = 'Not configured';
  userId: string = ''; // User ID from localStorage

  basicData: any; // Chart data
  basicOptions: any; // Chart options

  constructor(
    private timeInOutService: TimeInOutService,
    private employeeAttendanceService: EmployeeAttendanceService
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('id');
    if (storedId) {
      this.userId = storedId;
      this.getTotalTimeToday();
      this.getFrequentStatus();
      this.getLongestStreak();
      this.setChartData();
    } else {
      console.error('User ID not found in localStorage');
    }
  }

  // Fetch total time today
  getTotalTimeToday(): void {
    this.timeInOutService.getTotalTimeForToday(this.userId).subscribe(
      (res) => {
        this.totalTimeToday = res.total_time;
      },
      (err) => {
        console.error('Error fetching total time:', err);
      }
    );
  }

  // Fetch frequent status (static for now, update API logic if needed)
  getFrequentStatus(): void {
    this.frequentStatus = 'On Time'; // Replace with API logic if necessary
  }

  // Fetch longest streak (static for now, update API logic if needed)
  getLongestStreak(): void {
    this.longestStreak = '5 days'; // Replace with API logic if necessary
  }

  // Filter attendance data for the logged-in user
  filterAttendanceForUser(
    attendance: EmployeeAttendance[],
    userId: string
  ): EmployeeAttendance[] {
    return attendance.filter((record) => record.Id === userId);
  }

  // Get weekly attendance stats (Monday to Friday)
  getWeeklyAttendanceStats(attendance: EmployeeAttendance[]) {
    const stats = {
      Monday: { present: 0, absent: 0 },
      Tuesday: { present: 0, absent: 0 },
      Wednesday: { present: 0, absent: 0 },
      Thursday: { present: 0, absent: 0 },
      Friday: { present: 0, absent: 0 },
    };

    attendance.forEach((record) => {
      if (!record.time_in) return;

      const date = new Date(record.time_in);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

      if (stats[weekday as keyof typeof stats]) {
        if (record.time_out) {
          stats[weekday as keyof typeof stats].present++;
        } else {
          stats[weekday as keyof typeof stats].absent++;
        }
      }
    });

    return stats;
  }

  // Set chart data
  setChartData(): void {
    this.employeeAttendanceService.getEmployeeAttendanceData().subscribe(
      (data) => {
        const filteredData = this.filterAttendanceForUser(data, this.userId);
        const stats = this.getWeeklyAttendanceStats(filteredData);

        // Update the chart data
        this.basicData = {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          datasets: [
            {
              label: 'Present',
              backgroundColor: '#42A5F5',
              data: [
                stats.Monday.present,
                stats.Tuesday.present,
                stats.Wednesday.present,
                stats.Thursday.present,
                stats.Friday.present,
              ],
            },
            {
              label: 'Absent',
              backgroundColor: '#9CCC65',
              data: [
                stats.Monday.absent,
                stats.Tuesday.absent,
                stats.Wednesday.absent,
                stats.Thursday.absent,
                stats.Friday.absent,
              ],
            },
          ],
        };

        // Set chart options
        this.setChartOptions();
      },
      (err) => {
        console.error('Error fetching attendance data:', err);
      }
    );
  }

  // Set chart options
  setChartOptions(): void {
    this.basicOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Employee Attendance Chart',
          fontSize: 16,
        },
      },
    };
  }

  // Generate Excel Timesheet
  generateExcelTimesheet(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([{
      TotalTimeToday: this.totalTimeToday,
      FrequentStatus: this.frequentStatus,
      LongestStreak: this.longestStreak,
    }]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, 'Timesheet.xlsx');
  }
}
