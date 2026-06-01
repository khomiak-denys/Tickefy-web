import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsTabComponent } from './teams-tab.component';

describe('TeamsTabComponent', () => {
  let component: TeamsTabComponent;
  let fixture: ComponentFixture<TeamsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
