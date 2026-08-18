import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateTicketModalComponent } from './create-ticket-modal.component';
import { SimpleChange } from '@angular/core';

describe('CreateTicketModalComponent', () => {
  let component: CreateTicketModalComponent;
  let fixture: ComponentFixture<CreateTicketModalComponent>;
  let emmitedEvent: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTicketModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTicketModalComponent);
    component = fixture.componentInstance;
    emmitedEvent = jest.spyOn(component.submitted, 'emit');
    fixture.detectChanges();
  });

  it('should be empy and invalid on creation', () => {
    expect(component.form.invalid).toBeTruthy();

    expect(component.form.get('title')?.invalid).toBeTruthy();
    expect(component.form.get('title')?.value).toBe('');

    expect(component.form.get('description')?.value).toBe('');

    expect(component.form.get('deadline')?.invalid).toBeTruthy();
    expect(component.form.get('deadline')?.value).toBe('');
  });

  it('should set validaitors on title and deadline on create action', () => {
    component.submit('create');

    expect(component.form.get('title')?.invalid).toBeTruthy();
    expect(component.form.get('description')?.invalid).toBeTruthy();
    expect(component.form.get('deadline')?.invalid).toBeTruthy();
  });

  it('should have required description validation on create action', () => {
    component.submit('draft');

    expect(component.form.get('title')?.invalid).toBeTruthy();
    expect(component.form.get('description')?.invalid).toBeFalsy();
    expect(component.form.get('deadline')?.invalid).toBeTruthy();
  });

  it('should create ticket if all fields are valid', () => {
    component.form.get('title')?.setValue('Test title');
    component.form.get('description')?.setValue('Test description');
    component.form.get('deadline')?.setValue('2030-01-01');

    component.submit('create');

    expect(component.form.valid).toBeTruthy();
    expect(emmitedEvent).toHaveBeenCalledTimes(1);
    expect(emmitedEvent).toHaveBeenCalledWith({
      request: {
        title: 'Test title',
        description: 'Test description',
        deadline: '2030-01-01T00:00:00.000Z',
      },
      action: 'create',
    });
  });

  it('should create draft ticket if required fields are valid', () => {
    component.form.get('title')?.setValue('Test title');
    component.form.get('deadline')?.setValue('2030-01-01');

    component.submit('draft');

    expect(component.form.valid).toBeTruthy();
    expect(emmitedEvent).toHaveBeenCalledTimes(1);
    expect(emmitedEvent).toHaveBeenCalledWith({
      request: {
        title: 'Test title',
        description: '',
        deadline: '2030-01-01T00:00:00.000Z',
      },
      action: 'draft',
    });
  });

  it('should not submit if form is invalid', () => {
    component.submit('create');

    expect(emmitedEvent).not.toHaveBeenCalled();
  });

  it('should not submit if deadline is in past', () => {
    component.form.get('title')?.setValue('Test title');
    component.form.get('description')?.setValue('Test description');
    component.form.get('deadline')?.setValue('2020-01-01');

    component.submit('create');

    expect(emmitedEvent).not.toHaveBeenCalled();
  });

  it('should call closed event when close button is clicked', () => {
    const closedEvent = jest.spyOn(component.closed, 'emit');

    component.close();

    expect(closedEvent).toHaveBeenCalledTimes(1);
  });

  it('should reset form on onChanges call', () => {
    component.form.get('title')?.setValue('Test title');
    component.form.get('description')?.setValue('Test description');
    component.form.get('deadline')?.setValue('2030-01-01');

    component.ngOnChanges({ open: new SimpleChange(true, false, false) });

    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('deadline')?.value).toBe('');
  });
});
