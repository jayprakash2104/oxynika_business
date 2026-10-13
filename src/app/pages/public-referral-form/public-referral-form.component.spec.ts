import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicReferralFormComponent } from './public-referral-form.component';

describe('PublicReferralFormComponent', () => {
  let component: PublicReferralFormComponent;
  let fixture: ComponentFixture<PublicReferralFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicReferralFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PublicReferralFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
