import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsTabComponent } from './logs-tab.component';

describe('LogsTabComponent', () => {
  let component: LogsTabComponent;
  let fixture: ComponentFixture<LogsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
