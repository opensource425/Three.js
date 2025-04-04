import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Webmanual } from './webmanual.component';

describe('Webmanual', () => {
  let component: Webmanual;
  let fixture: ComponentFixture<Webmanual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Webmanual ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Webmanual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
