import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReasonModalComponent } from './reason-modal.component';
import { SimpleChange } from '@angular/core';

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

  it('should mark form as touched if submitted invalid', () => {
    component.form.get('reasonText')?.setValue('');
    component.submit();
    expect(component.form.touched).toBeTruthy();
  });

  it('should emit reasonText if form is valid and submit is called', () => {
    jest.spyOn(component.submitted, 'emit');
    component.form.get('reasonText')?.setValue('Because I can');
    component.submit();
    expect(component.submitted.emit).toHaveBeenCalledWith('Because I can');
  });

  it('should reset form when closed via ngOnChanges', () => {
    component.form.get('reasonText')?.setValue('dirty');
    component.ngOnChanges({
      open: new SimpleChange(true, false, false),
    });
    expect(component.form.get('reasonText')?.value).toBe('');
  });

  it('should emit cancelled and reset when cancel is called', () => {
    jest.spyOn(component.cancelled, 'emit');
    component.form.get('reasonText')?.setValue('dirty');
    component.cancel();
    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.form.get('reasonText')?.value).toBe('');
  });
});
