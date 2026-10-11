import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BdoListComponent } from './bdo-list.component';

describe('BdoListComponent', () => {
  let component: BdoListComponent;
  let fixture: ComponentFixture<BdoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BdoListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BdoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
