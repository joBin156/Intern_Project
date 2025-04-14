import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeAttendance } from '../domain/employee-attendance';

@Injectable({
  providedIn: 'root',
})
export class EmployeeAttendanceService {
  private apiUrl = 'localhost:80/'; // Update with your API URL

  constructor(private http: HttpClient) {}

  getEmployeeAttendanceData(): Observable<EmployeeAttendance[]> {
    return this.http.get<EmployeeAttendance[]>(`${this.apiUrl}`);
  }
}
