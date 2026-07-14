import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsersTabComponent } from './users-tab.component';

describe('UsersTabComponent', () => {
  let component: UsersTabComponent;
  let fixture: ComponentFixture<UsersTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTabComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
