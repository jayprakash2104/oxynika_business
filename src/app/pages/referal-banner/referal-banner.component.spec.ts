import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferalBannerComponent } from './referal-banner.component';

describe('ReferalBannerComponent', () => {
  let component: ReferalBannerComponent;
  let fixture: ComponentFixture<ReferalBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferalBannerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReferalBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
