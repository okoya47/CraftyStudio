import { Component, inject } from '@angular/core';
import { Auth } from '../../Auth/auth';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-user-badge',
  template: `
    <div
      class="user-badge"
      [ngStyle]="{ 'background-color': bgColor }"
      [matTooltip]="email()"
      matTooltipClass="user-tooltip"
      matTooltipPosition="below"
    >
      {{ initial() }}
    </div>
  `,
  styles: [`
    .user-badge {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 1px solid #362214;
      color: #fff;
      font-weight: bold;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      transition: transform 0.2s ease;
    }

    .user-badge:hover {
      transform: scale(1.1);
    }
  `],
  standalone: true,
  imports: [CommonModule, MatTooltipModule]
})
export class UserBadge {
  private readonly auth = inject(Auth);

  readonly initial = this.auth.initialSignal;
  readonly email = this.auth.emailSignal;

  readonly bgColor = this.getColorFromUsername(this.auth.usernameSignal());

   private getColorFromUsername(username: string): string {
    const colors = ['#883c3cff', '#348681ff', '#556270', '#4b5c25ff', '#FFA07A', '#6A5ACD', '#16807aff'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
