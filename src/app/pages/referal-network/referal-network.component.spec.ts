import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferalNetworkComponent } from './referal-network.component';

describe('ReferalNetworkComponent', () => {
  let component: ReferalNetworkComponent;
  let fixture: ComponentFixture<ReferalNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferalNetworkComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReferalNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
