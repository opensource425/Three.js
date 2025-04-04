import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';
import { ModelService } from '../../services/modelviewer/model.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})

export class AppLayoutComponent implements OnInit {
  public currentLang
  public title
  public nData
  public navData
  public activeModelData
  public activeModelID
  public viewToken

  constructor(private router:Router,private modelService:ModelService,private activatedRoute: ActivatedRoute ) { 
    this.currentLang = 'en'
    this.title = 'Service Manual EN'
    this.navData = []
    this.nData = {'data':[]}
  }

  async ngOnInit(): Promise<void> {
    this.currentLang = localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
     this.nData =  await new Promise(resolve => this.modelService.getModel().subscribe(response => {
      resolve(response) 
    })); 
    
    let title
    this.activeModelID = this.activatedRoute.firstChild ? this.activatedRoute.firstChild.snapshot.paramMap.get('modelID') : null
    console.log("nDtaa",this.activeModelID)
    if(this.nData.data.length > 0) {
       
        if(!this.activeModelID){      
  
          let sortArr = []
          this.nData.data.forEach(row => { 
            if(row.status) sortArr.push(row)
          }) 
         
        sortArr.sort(function (a, b) {
          return a.order - b.order
        })
       
        this.activeModelID =  sortArr[0]._id;  
        }
  
        this.activeModelData = await new Promise(resolve => this.modelService.getModelById(this.activeModelID).subscribe(response => {
          resolve(response) 
        }));

        title = this.activeModelData.data[0].data.find(row=>row.language == this.currentLang).title;
  
        if (!title){
            title = this.activeModelData.data[0].data.find(row=>row.language == 'en').title;
        }
      }else{
        title = 'service Manual EN'
      }
        this.title = title.charAt(0).toUpperCase() + title.slice(1)
        let handler = document.querySelector('.handler') as HTMLDivElement;
        let wrapper = handler.closest('.wrapper') as HTMLDivElement;
        let boxA = wrapper.querySelector('.box') as HTMLDivElement;
        let isHandlerDragging = false;
    
    /* Mouse handler for resize for web and device*/
    document.addEventListener('mousedown', function(e) {
      // If mousedown event is fired from .handler, toggle flag to true
      if (e.target === handler) {
        isHandlerDragging = true;
      }
    });

    document.addEventListener('touchstart', function(e) {
      // If mousedown event is fired from .handler, toggle flag to true
      if (e.target === handler) {
        isHandlerDragging = true;
      }
    });
     
    //  handler for web
      handler.addEventListener('mousemove', function(e) {
      
      // Don't do anything if dragging flag is false
      if (!isHandlerDragging) {
        return false;
      }
      
      // Get offset
      let containerOffsetLeft = wrapper.offsetLeft;
    
      // Get x-coordinate of pointer relative to container
      let pointerRelativeXpos = e.clientX - containerOffsetLeft;
      
      // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
      let boxAminWidth = 400;
    
      // Resize box A
      // * 8px is the left/right spacing between .handler and its inner pseudo-element
      // * Set flex-grow to 0 to prevent it from growing
      boxA.style.width = (Math.max(boxAminWidth, pointerRelativeXpos - 8)) + 'px';
      boxA.style.flexGrow = '0';
    });

    //handler for device
    handler.addEventListener('touchmove', function(e) {
      
      // Don't do anything if dragging flag is false
      if (!isHandlerDragging) {
        return false;
      }
      // Get offset
      let containerOffsetLeft = wrapper.offsetLeft;
    
      // Get x-coordinate of pointer relative to container
      let pointerRelativeXpos = e.touches[0].clientX- containerOffsetLeft;
      
      // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
      let boxAminWidth = 400;
    
      // Resize box A
      // * 8px is the left/right spacing between .handler and its inner pseudo-element
      // * Set flex-grow to 0 to prevent it from growing
      boxA.style.width = (Math.max(boxAminWidth, pointerRelativeXpos - 8)) + 'px';
      boxA.style.flexGrow = '0';
    });
    
    document.addEventListener('mouseup', function(e) {
      // Turn off dragging flag when user mouse is up
      isHandlerDragging = false;

    });
  }
  
  /* change language */
  changeLang = (Event:any) => {
    localStorage.setItem('frontLang', Event.target.value)
    window.location.reload();
  }


  /*setModelID*/
  setModelID = (title:String,_id:String) => {    
    this.title = title.charAt(0).toUpperCase() + title.slice(1)
    this.router.navigate(['/imanual/'+_id]);
  }

  /* Get Page ID */
  getHtmlToken(pageId:string){
    this.viewToken = pageId
  }

}
