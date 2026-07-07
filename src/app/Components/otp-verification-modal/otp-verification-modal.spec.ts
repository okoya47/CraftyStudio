import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpVerificationModal } from './otp-verification-modal';

describe('OtpVerificationModal', () => {
  let component: OtpVerificationModal;
  let fixture: ComponentFixture<OtpVerificationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpVerificationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpVerificationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
