import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitButtonComponent } from './split-button.component';

describe('SplitButtonComponent', () => {
  let component: SplitButtonComponent;
  let fixture: ComponentFixture<SplitButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitButtonComponent);
    component = fixture.componentInstance;
    component.options = [{ value: 'test', title: 'Test', description: 'desc' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
