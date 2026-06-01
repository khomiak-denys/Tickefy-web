import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsTabComponent } from './tickets-tab.component';

describe('TicketsTabComponent', () => {
  let component: TicketsTabComponent;
  let fixture: ComponentFixture<TicketsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
