import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Privilege } from './privilege';

describe('Privilege', () => {
  let component: Privilege;
  let fixture: ComponentFixture<Privilege>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privilege]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privilege);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
