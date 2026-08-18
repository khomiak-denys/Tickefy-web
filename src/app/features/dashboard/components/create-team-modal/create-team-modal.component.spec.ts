import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTeamModalComponent } from './create-team-modal.component';
import { Category } from '../../../../core/api/dtos';
import { SimpleChange } from '@angular/core';

describe('CreateTeamModalComponent', () => {
  let component: CreateTeamModalComponent;
  let fixture: ComponentFixture<CreateTeamModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTeamModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTeamModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submitted with correct data when valid', () => {
    jest.spyOn(component.submitted, 'emit');
    component.form.patchValue({
      name: 'Avengers',
      description: 'Superheroes',
      category: Category.Other,
    });

    component.submit();

    expect(component.submitted.emit).toHaveBeenCalledWith({
      name: 'Avengers',
      description: 'Superheroes',
      category: Category.Other,
    });
  });

  it('should mark all controls as touched if invalid submit', () => {
    jest.spyOn(component.form, 'markAllAsTouched');
    jest.spyOn(component.submitted, 'emit');

    component.submit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(component.submitted.emit).not.toHaveBeenCalled();
  });

  it('should emit closed when close is called', () => {
    jest.spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should reset form on close (ngOnChanges)', () => {
    jest.spyOn(component.form, 'reset');

    component.ngOnChanges({
      open: new SimpleChange(true, false, false),
    });

    expect(component.form.reset).toHaveBeenCalled();
  });
});
