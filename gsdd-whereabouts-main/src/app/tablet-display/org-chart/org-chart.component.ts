import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StatusService } from 'src/service/status.service';
import { EmployeeStatus } from 'src/domain/employee-status';
import { TimeInOutService } from 'src/service/time-in-out.service';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.css'],
})
export class OrgChartComponent implements OnInit {
  visible: boolean = false;
  csFlow: boolean = false;
  baseUrlAPI = `${environment.WSSUrl}`;
  socket = new WebSocket(`ws://${this.baseUrlAPI}`);
  employeeStatuses: EmployeeStatus[] = [];
  timeInData: any[] = [];
  statusData: any = [];

  constructor(
    private statusService: StatusService,
    private timeInOutService: TimeInOutService
  ) {}

  ngOnInit() {
    this.getAllLatestStatus();
    this.listenForNewMessages();
    this.fetchTimeInData();
  }

  getAllLatestStatus() {
    this.statusService.getAllLatestStatus().subscribe((res) => {
      this.employeeStatuses.push(...res);
    });
  }

  listenForNewMessages() {
    this.socket.addEventListener('message', (event) => {
      if (!event.data) return;

      let newStatus;
      try {
        newStatus = JSON.parse(event.data);
      } catch (err) {
        return;
      }

      const employeeStatus: EmployeeStatus = {
        first_name: newStatus.first_name,
        last_name: newStatus.last_name,
        status: newStatus.setStatus?.status || null,
      };

      this.employeeStatuses.push(employeeStatus);
    });
  }

  getStatus(first_name: string, last_name: string): string | null {
    const employee = this.employeeStatuses
      .filter(
        (e) => e.first_name === first_name && e.last_name === last_name
      )
      .slice(-1)[0];
    return employee?.status || null;
  }

  fetchTimeInData() {
    this.timeInOutService.getAllLatestTimeInToday().subscribe((res) => {
      this.timeInData.push(...res);
    });
  }

  isTimeIn(first_name: string, last_name: string): boolean {
    return this.timeInData.some(
      (e) => e.first_name === first_name && e.last_name === last_name
    );
  }

  getBorderColor(timeInStatus: boolean, color: string): string {
    return timeInStatus ? 'border-gray-500' : color;
  }

  showDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
  }

  csFlowShow() {
    this.csFlow = true;
  }

  csFlowClose() {
    this.csFlow = false;
  }
}
