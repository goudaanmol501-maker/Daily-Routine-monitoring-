import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SleepChart } from './sleep-chart';

describe('SleepChart', () => {
  let component: SleepChart;
  let fixture: ComponentFixture<SleepChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SleepChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SleepChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
