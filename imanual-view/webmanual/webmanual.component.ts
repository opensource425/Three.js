import { Component,ViewChild,ElementRef,Renderer2,OnInit,Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModelService } from '../../services/modelviewer/model.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'web-manual',
  templateUrl: './webmanual.component.html',
  styleUrls: ['./webmanual.component.scss']
})

export class WebmanualComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef;
  @Input() viewToken: string;
  source: string = '';
  frame1: string = '';
  private activeModelID
  private modelData
  editurl: string = 'javascript:void(0)';
  public iFrameUrl
  public urlSafe
  public htmlLang

  constructor(public sanitizer: DomSanitizer, private renderer: Renderer2, private modelService: ModelService,private activatedRoute: ActivatedRoute) { }
  ngOnChanges() {
    this.ngOnInit()
  }

  async  ngOnInit():  Promise<void> {
    this.htmlLang = localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
    this.activeModelID = this.activatedRoute.firstChild ? this.activatedRoute.firstChild.snapshot.paramMap.get('modelID') : null
    let allModel:any = await new Promise(resolve => this.modelService.getModel().subscribe(response => {
      resolve(response) 
    }));

    if( allModel.data.length>0 )
     {
      if(!this.activeModelID)
       {
        let sortArr = []
        allModel.data.forEach(row => { 
          if(row.status) sortArr.push(row)
        }) 
       
        sortArr.sort(function (a, b) {
          return a.order - b.order
        })
     
        this.activeModelID = sortArr[0]._id;  
      }
       let htmlPath

      if (this.activeModelID)
      {
        this.modelData = await new Promise(resolve => this.modelService.getModelById(this.activeModelID).subscribe(response => {
          resolve(response) 
        }));

        htmlPath = this.modelData.data[0].data.find(row=>row.language == this.htmlLang).path;
      }
    
      if(!htmlPath)
      {
        htmlPath = 'assets/html/'
      }
      
      if(this.viewToken)
      {       
        //this.iFrameUrl = this.viewToken == "index" ? htmlPath+'/OMNI_Service_Manual.html' : htmlPath+'/TrainingMaterial/content/'+this.viewToken;
        this.iFrameUrl = this.viewToken == "index" ? htmlPath+'/OMNI_Service_Manual.html' : htmlPath+'/TrainingMaterial/index.html?elementId='+this.viewToken;
      }else 
      {
        this.iFrameUrl = htmlPath+'/index.html';
        let res = this.httpGet(this.iFrameUrl)
        if(res == 404)
        this.iFrameUrl = htmlPath+'/TrainingMaterial/index.html';
      }
    }else 
    {
      this.iFrameUrl = 'assets/html/index.html'
    }
   console.log("HTML LINKS",this.iFrameUrl);
  }

   httpGet = (theUrl) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.status
}
}
