import { TestBed } from '@angular/core/testing';

import { RolePrivilege } from './role-privilege';

describe('RolePrivilege', () => {
  let service: RolePrivilege;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolePrivilege);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
