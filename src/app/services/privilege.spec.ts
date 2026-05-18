import { TestBed } from '@angular/core/testing';

import { Privilege } from './privilege';

describe('Privilege', () => {
  let service: Privilege;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Privilege);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
