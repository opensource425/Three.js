
import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../services/appservices/app.service';


@Component({
  selector: 'cms-alink',
  templateUrl:'./cmslink.component.html',
  styleUrls: ['./cmslink.component.scss']
})

export class CmsLinkComponent implements OnInit  {
  name = 'CMS'
  public cmsLinks
  private data
  public langCode

  constructor(private appService:AppService, private router:Router) {
    this.langCode  
  }
   
    async ngOnInit() { 
      this.langCode = localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
        this.data = await new Promise(resolve => this.appService.getCMSLinks().subscribe(response => {
          resolve(response) 
        })); 
        console.log('cmslink', this.data.data   )
        this.cmsLinks = this.data.data            
    }
    
    getPage = (id:String) => {
     this.router.navigate(['/imanual/cms/'+id]);
    }
 
}


