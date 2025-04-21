import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountService } from 'src/service/employee-account.service';
import { Account } from 'src/domain/employee-account';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  User!: Account;
  selectedFile: File | null = null;  // ← Declare the selectedFile property

  constructor(
    private accountService: AccountService,
    private http: HttpClient,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.accountService.getCurrentUser().subscribe(
      (data: Account) => {
        this.User = data;
      },
      (err: any) => {
        console.error('Failed to fetch user data:', err);
      }
    );
  }

  openModal(): void {
    const modal = this.el.nativeElement.querySelector('#change-picture-modal');
    const mainContent = this.el.nativeElement.querySelector('#main-content');
    this.renderer.removeClass(modal, 'hidden');
    this.renderer.setAttribute(mainContent, 'inert', '');
    modal.focus();
  }

  closeModal(): void {
    const modal = this.el.nativeElement.querySelector('#change-picture-modal');
    const mainContent = this.el.nativeElement.querySelector('#main-content');
    this.renderer.addClass(modal, 'hidden');
    this.renderer.removeAttribute(mainContent, 'inert');
  }

  // Called when the user selects a file
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Called when the user clicks "Save"
  saveProfileImage(): void {
    if (!this.selectedFile) {
      console.warn('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);

    this.http.post('http://localhost/api/upload-profile-image', formData).subscribe(
      (response: any) => {
        console.log('Profile image uploaded:', response);
        this.closeModal();
        this.loadCurrentUser();  // Refresh the displayed user data
      },
      (err: any) => {
        console.error('Upload failed:', err);
      }
    );
  }
}
