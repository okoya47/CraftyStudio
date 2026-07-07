import { Component } from '@angular/core';
import { ContactMessage } from '../../Models/user.Model';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../Services/user-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  imports: [FormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs {
  contact: ContactMessage = { name: '', email: '', message: '' };

  constructor(
    private contactService: UserService,
    private toastr: ToastrService
  ) { }

  onSubmit(): void {
    this.contactService.sendMessage(this.contact).subscribe({
      next: () => {
        this.toastr.success('Message sent successfully!');
        this.contact = { name: '', email: '', message: '' }; // reset form
      },
      error: () => {
        this.toastr.error('Failed to send message. Please try again.');
      }
    });
  }
}

