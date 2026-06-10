import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDetailsModalComponent } from './team-details-modal.component';

describe('TeamDetailsModalComponent', () => {
  let component: TeamDetailsModalComponent;
  let fixture: ComponentFixture<TeamDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
