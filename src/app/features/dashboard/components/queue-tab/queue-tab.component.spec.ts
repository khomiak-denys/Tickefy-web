import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueTabComponent } from './queue-tab.component';

describe('QueueTabComponent', () => {
  let component: QueueTabComponent;
  let fixture: ComponentFixture<QueueTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QueueTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
