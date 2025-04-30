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
    if (!this.Id) {
      alert('User ID not found');
      return;
    }
    
    const currentTime = new Date();

    this.timeInOutService.timeIn(this.Id, currentTime).subscribe({
      next: (response: any) => {
        console.log('Time-in successful:', response);
        if (response && response.success) {
          this.setTimeIn(this.timeDisplay);
          this.timeOutID = response.data?.Id;
          this.check_time_out = false;
          alert('Time-in successful');
        } else {
          console.error('Invalid response:', response);
          alert(response?.message || 'Already timed in');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        alert(err.error?.message || 'Failed to time in. Please check your connection and try again.');
      }
    });
  }

  /** Clock the user out */
  timeOut(): void {
    if (!this.timeOutID) {
      alert('No active time-in record found');
      return;
    }

    const currentTime = new Date();
    
    this.timeInOutService.timeOut(this.timeOutID, currentTime).subscribe({
      next: (response: any) => {
        console.log('Time-out successful:', response);
        this.setTimeOut(this.timeDisplay);
        this.check_time_out = true;
        alert(response.message || 'Time-out successful');
      },
      error: (err) => {
        console.error('API Error:', err);
        alert(err.error?.message || 'Failed to time out');
      }
    });
  }

  isTimeIn() {
    this.timeInOutService.isTimeIn(this.Id).subscribe((res) => {
      if (res.dataOfTimeIn) {
        this.setTimeIn(res.dataOfTimeIn);
        this.timeOutID = res.Id;
      } else {
        console.log('No time in');
        this.timeOutID = ''; 
      }
    });
  }

  isTimeOut() {
    this.timeInOutService.isTimeOut(this.Id).subscribe({
      next: (res) => {
        if (res.dataOfTimeOut) {
          this.setTimeOut(res.dataOfTimeOut);
          this.check_time_out = true;
        } else {
          this.setTimeOut('--');
          this.check_time_out = false;
          console.log('No time out');
        }
      },
      error: (err) => {
        console.error('Error checking time out status:', err);
        this.check_time_out = false;
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

