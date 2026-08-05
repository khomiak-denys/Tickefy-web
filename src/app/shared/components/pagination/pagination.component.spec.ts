import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { IconsModule } from '../../icons/icons.module';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, IconsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default inputs hasPrev and hasNext to false', () => {
    expect(component.hasPrev).toBe(false);
    expect(component.hasNext).toBe(false);
  });

  it('should emit previousPage event on onPrev', () => {
    const spy = jest.spyOn(component.previousPage, 'emit');
    component.onPrev();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit nextPage event on onNext', () => {
    const spy = jest.spyOn(component.nextPage, 'emit');
    component.onNext();
    expect(spy).toHaveBeenCalled();
  });
});
