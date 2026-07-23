import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonModalComponent } from './reason-modal.component';

describe('ReasonModalComponent', () => {
  let component: ReasonModalComponent;
  let fixture: ComponentFixture<ReasonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasonModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReasonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
