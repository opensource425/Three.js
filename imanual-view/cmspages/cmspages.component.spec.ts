import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsPagesComponent } from './cmspages.component';

describe('MainLayoutComponent', () => {
  let component: CmsPagesComponent;
  let fixture: ComponentFixture<CmsPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmsPagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
