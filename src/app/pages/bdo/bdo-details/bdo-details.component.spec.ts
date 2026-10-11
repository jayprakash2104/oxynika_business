import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BdoDetailsComponent } from './bdo-details.component';

describe('BdoDetailsComponent', () => {
  let component: BdoDetailsComponent;
  let fixture: ComponentFixture<BdoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BdoDetailsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BdoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
