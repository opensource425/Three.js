
import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppService } from '../../services/appservices/app.service';
import { ModelService } from '../../services/modelviewer/model.service';

@Component({
  selector: 'cms-apage',
  templateUrl:'./cmspages.component.html',
  styleUrls: ['./cmspages.component.scss']
})

export class CmsPagesComponent implements OnInit  {
  name = 'CMS'
  private cmsData 
  public currentLang
  private sData
  public navSData
  constructor(private appService: AppService, private router:Router,  private route: ActivatedRoute, private modelService:ModelService) {
  this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  this.navSData = []
  this.sData = ['data']
  console.log('okkk')
    
  }
   
    async ngOnInit() { 
      console.log('ok')
         this.currentLang =  localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
         this.sData =  await new Promise(resolve => this.modelService.getModel().subscribe(response => {
          resolve(response) 
        })); 
        
         const id = this.route.snapshot.paramMap.get('pageId');
          this.cmsData = await new Promise(resolve => this.appService.getCMSData(id).subscribe(response => {
          resolve(response) 
        })); 
         
          this.cmsData.data[0].datum.forEach(function (value) {
          let currentLangVal = localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
          let titleElement = document.querySelector('.page-title') as HTMLDivElement;
          if (value.language == currentLangVal){
            let container = document.createElement( 'div' );    
            container.innerHTML  = value.data  
            titleElement.innerHTML = '<h3 style="color:#ffffff">'+value.title+'</h3>'
            document.getElementById("cms-app").appendChild( container ); 
          }
        });          
  }
 
  changeLang = (Event:any) => {
    localStorage.setItem('frontLang', Event.target.value)
    window.location.reload();
  }
  goToModel = (_id:String) => {
    this.router.navigate(['/imanual/'+_id]);
  }
 
}


