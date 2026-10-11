import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubAdminDetailsComponent } from './sub-admin-details.component';

describe('SubAdminDetailsComponent', () => {
  let component: SubAdminDetailsComponent;
  let fixture: ComponentFixture<SubAdminDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubAdminDetailsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SubAdminDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
