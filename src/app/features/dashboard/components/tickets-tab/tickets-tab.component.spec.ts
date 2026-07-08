import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TicketsTabComponent } from './tickets-tab.component';

describe('TicketsTabComponent', () => {
  let component: TicketsTabComponent;
  let fixture: ComponentFixture<TicketsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsTabComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
