import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePrivilege } from './role-privilege';

describe('RolePrivilege', () => {
  let component: RolePrivilege;
  let fixture: ComponentFixture<RolePrivilege>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePrivilege]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePrivilege);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
