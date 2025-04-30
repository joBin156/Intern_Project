import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { TabService } from './tab.service';

@Injectable({
  providedIn: 'root',
})
export class TimeInOutService {
  private baseUrl = environment.apiUrl;
  private apiUrl = "http://localhost:80/";

  constructor(private http: HttpClient) {}

  timeIn(user_Id: string, time_in: Date): Observable<any> {
    const payload = {
      user_Id: user_Id,
      time_in: time_in
    };
    
    return this.http.post(`${this.apiUrl}/time_in`, payload).pipe(
      tap((response: any) => {
        if (response.success) {
          // Cache the response locally with the record ID
          localStorage.setItem('lastTimeIn', JSON.stringify({
            user_Id,
            time_in,
            record_id: response.data.Id,
            timestamp: new Date().getTime()
          }));
        }
      }),
      catchError((error) => {
        console.error('Error during timeIn:', error);
        localStorage.removeItem('lastTimeIn');
        return throwError(() => error);
      })
    );
  }

  timeOut(time_out_Id: string, time_out: Date): Observable<any> {
    return this.http.put(`${this.apiUrl}/time_out/${time_out_Id}`, {
      time_out,
    });
  }

  getTotalTimeForToday(user_Id: string): Observable<any> {
    //return this.http.get(`${this.baseUrlAPI}total_time/${time_out_Id}`);
    console.log(user_Id)
    return this.http.get(`${this.apiUrl}/total_time/${user_Id}`);//updated
  }

  setTotalTime(time_out_Id: string, total_time: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/set_total_time/${time_out_Id}`, {
      total_time,
    });
  }

  setAllowedTime(time: string, pauseTracking: boolean): Observable<any> {
    const payload = { time, pauseTracking };
    return this.http.post(`${this.baseUrl}allowed-time`, payload);
  }
  
  isTimeIn(user_Id: string | null): Observable<any> {
    return this.http.get(`${this.baseUrl}/check_time_in_today/${user_Id}`);
  }

  isTimeOut(user_Id: string | null): Observable<any> {
    return this.http.get(`${this.baseUrl}/check_time_out_today/${user_Id}`);
  }

  getTimeInAndOut(user_Id: string | null): Observable<any>{
    return this.http.get(`${this.baseUrl}get_time_in_and_out/${user_Id}`);
  }

  updateData(Id: string | null, time_in: Date, time_out: Date): Observable<any>{
    return this.http.put(`${this.baseUrl}/update_Data/${Id}`, {time_in ,time_out})
  }
  
  getAllLatestTimeInToday(): Observable<any>{
    return this.http.get(`${this.baseUrl}/all_latest_time_in`);
  }

  getAllDataTimeInOut(): Observable<any>{
    return this.http.get(`${this.baseUrl}/get_all_data_time_in_out`);
  }
}
