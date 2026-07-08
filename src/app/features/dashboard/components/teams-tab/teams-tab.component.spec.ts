import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TeamsTabComponent } from './teams-tab.component';

describe('TeamsTabComponent', () => {
  let component: TeamsTabComponent;
  let fixture: ComponentFixture<TeamsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsTabComponent, IconsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
