import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TabService } from 'src/service/tab.service';
import { TimeInOutModalService } from 'src/service/time-in-out-modal.service';
import { TimeInOutService } from 'src/service/time-in-out.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-timeinout',
  templateUrl: './timeinout.component.html',
  styleUrls: ['./timeinout.component.css'],
})
export class TimeinoutComponent implements OnInit {
  CURRENT_TIME_DISPLAY_ONLY?: string;
  public currentDate?: string = new Date().toLocaleTimeString();

  private timeInDate: string | undefined;
  private timeOutDate: string | undefined;
  private timeInTime: string | undefined = '--';
  private timeOutTime: string | undefined = '--';

  timeDisplay = '';
  timeDisplayModified = false;

  Id = localStorage.getItem('id');
  check_time_out: boolean = false;
  isTimedIn: boolean = false;
  timeOutID = '';

  constructor(
    private tabService: TabService,
    private timeInOutModalService: TimeInOutModalService,
    private timeInOutService: TimeInOutService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {
    setInterval(() => {
      this.CURRENT_TIME_DISPLAY_ONLY = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      if (!this.timeDisplayModified) {
        let date = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        });

        let time = new Date().toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        let hours = new Date().getHours().toString().padStart(2, '0');
        let minutes = new Date().getMinutes().toString().padStart(2, '0');
        let seconds = new Date().getSeconds().toString().padStart(2, '0');

        this.timeDisplay = `${hours}:${minutes}:${seconds}`;

        this.currentDate = `${date}`;
      }
    }, 1000);
  }
  
  isOpen$ = this.timeInOutModalService.isOpen$;

  ngOnInit(): void {
    this.timeInOutModalService.closeModal();

    this.isTimeIn();
    this.isTimeOut();
  }

  openTimeInOutModal() {
    this.timeInOutModalService.openModal();
  }

  closeTimeInOutModal() {
    this.timeDisplayModified = false;
    this.timeInOutModalService.closeModal();
  }

  onTimeChange(event: any) {
    this.timeDisplayModified = true;
    this.timeDisplay = event;
  }

  getTimeIn() {
    return this.timeInTime;
  }

  setTimeIn(timeIn?: string) {
    this.timeInTime = timeIn;
  }

  getTimeOut() {
    return this.timeOutTime;
  }

  setTimeOut(timeOut?: string) {
    this.timeOutTime = timeOut;
  }

  getId() {
    return this.Id;
  }

  timeOutId = '';

  // Inside TimeinoutComponent

  /** Clock the user in */
  timeIn(): void {
    const payload = {
      userId: this.Id,           // make sure this matches your backend’s field
      timeIn: this.timeDisplay,  // e.g. “08:30:00”
    };

    console.log('Time-in payload:', payload);

    this.http.post('http://localhost:80/employee-timein', payload).subscribe({
      next: (response: any) => {
        console.log('Time-in successful:', response);
        alert(response.message || 'Time-in successful');
        this.setTimeIn(this.timeDisplay);
        this.check_time_out = false;
      },
      error: (err) => {
        console.error('API Error:', err, err.error);
        alert(err.error?.message || 'Failed to time in.');
      }
    });
  }

  /** Clock the user out */
  timeOut(): void {
    const payload = {
      userId: this.Id,
      timeOut: this.timeDisplay,
    };

    console.log('Time-out payload:', payload);

    this.http.post('http://localhost:80/employee-timeout', payload).subscribe({
      next: (response: any) => {
        console.log('Time-out successful:', response);
        alert(response.message || 'Time-out successful');
        this.setTimeOut(this.timeDisplay);
        this.check_time_out = true;
        // then fetch & update total time as before...
      },
      error: (err) => {
        //console.error('API Error:', err, err.error);
        alert(err.error?.message || 'Failed to time out.');
      }
    });
  }

  isTimeIn() {
    this.timeInOutService.isTimeIn(this.Id).subscribe((res) => {
      if (res.dataOfTimeIn) {
        this.setTimeIn(res.dataOfTimeIn);
        this.timeOutId = res.Id;
      } else {
        console.log('No time in');
      }
    });
  }

  isTimeOut() {
    this.timeInOutService.isTimeOut(this.Id).subscribe((res) => {
      if (res.dataOfTimeOut) {
        this.setTimeOut(res.dataOfTimeOut);
        this.check_time_out = true;
      } else {
        console.log('No time out');
      }
    });
  }

    toggleTime(): void {
    this.check_time_out = !this.check_time_out;
  }

  goToTimeSheet() {
    this.tabService.changeTab(1);
  }
}

