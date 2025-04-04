import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material-modules';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModelViewComponent } from "../../imanual-view/modelviewer/modelview.component";
import { CmsLinkComponent } from '../../imanual-view/cmslink/cmslink.component'
import { WebmanualComponent } from '../../imanual-view/webmanual/webmanual.component'
import { CmsPagesComponent } from '../../imanual-view/cmspages/cmspages.component';
import { AppHeaderModule } from '@coreui/angular';
import { SafePipeComponent } from '../../imanual-view/model-helper/safepipe.component';
import { OrderByPipe } from '../../imanual-view/model-helper/orderpipe.component';
import { NgbdModalContent } from "../../imanual-view/modelviewer/modelview.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    MaterialModule,
    FlexLayoutModule,
    AppHeaderModule
  ],
   exports: [AppLayoutComponent],
  declarations: [AppLayoutComponent,ModelViewComponent,CmsLinkComponent,WebmanualComponent,CmsPagesComponent,SafePipeComponent,OrderByPipe,NgbdModalContent ],
})
export class AppLayoutModule {}