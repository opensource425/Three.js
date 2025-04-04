import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsLinkComponent } from './cmslink.component';

describe('MainLayoutComponent', () => {
  let component: CmsLinkComponent;
  let fixture: ComponentFixture<CmsLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmsLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
