import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { CmsPagesComponent } from '../cmspages/cmspages.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material-modules';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { CmsLinkComponent } from '../../imanual-view/cmslink/cmslink.component'
import { AppHeaderModule } from '@coreui/angular';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    MaterialModule,
    FlexLayoutModule,
    AppHeaderModule
  ],

  declarations: [ ],
})
export class CmsLayoutModule {}