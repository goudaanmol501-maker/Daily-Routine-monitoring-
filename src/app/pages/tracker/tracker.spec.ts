import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackerComponent } from './tracker';

describe('TrackerComponent', () => {
  let component: TrackerComponent;
  let fixture: ComponentFixture<TrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
