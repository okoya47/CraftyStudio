import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../Auth/auth';

@Component({
  selector: 'app-footer',
  imports: [RouterModule ],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
constructor (
  private service: Auth,
  private route: Router, 
){}

signOut(){
  this.service.loggingOut();
  this.route.navigate(['signin']);
}
}
