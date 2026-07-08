import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LogsTabComponent } from './logs-tab.component';

describe('LogsTabComponent', () => {
  let component: LogsTabComponent;
  let fixture: ComponentFixture<LogsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsTabComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
