import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationRequestsComponent } from './activation-requests.component';

describe('ActivationRequestsComponent', () => {
  let component: ActivationRequestsComponent;
  let fixture: ComponentFixture<ActivationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationRequestsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ActivationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
