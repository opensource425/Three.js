import { Component ,Output, EventEmitter, OnInit, Renderer2, Input} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }  from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass }  from 'three/examples/jsm/postprocessing/OutlinePass.js' 
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { ModelService } from '../../services/modelviewer/model.service';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { langBtns } from '../model-helper/lang.component';
import {NgbActiveModal, NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-body">
    <div class="embed-responsive embed-responsive-21by9">
    <iframe class="embed-responsive-item" [src]="videoSrc | safe" ></iframe>   
    </div>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class NgbdModalContent {
  @Input() videoSrc;
  constructor(public activeModal: NgbActiveModal) {}
}

@Component({
  selector: 'imanual-app',
  templateUrl:'./modelview.component.html',
  styleUrls: ['./modelview.component.css']
})

export class ModelViewComponent implements OnInit  {
  name = 'Imanual';
  
  @Output("getHtmlToken") getHtmlToken: EventEmitter<any> = new EventEmitter();
  private scene;
  private rgbLoader;
  private controls;
  private raycaster;  
  private mixer;
  private model;
  private camera;
  private renderer;
  private clock;
  private container;
  private composer ;
  private outlinePass;
  private envMap;
  private texture;
  private pmremGenerator;
  private progressBar;
  private renderPass; 
  private composerLoad 
  private cam;
  private navButtons;
  private animationPlay;
  private iniLoad
  private animationClip
  private webEnable;
  private modelData
  public  handler
  public  wrapper
  public  boxA
  public  isHandlerDragging
  private activeModelID
  private controlData
  private modelGrps
  private animMixerCallbacks
  private replay
  private mouseDrag
  private hoverName
  private htmlLang 
  public  cntBtn
  private capterLabel
  private viewState
  private reverse
  private stateObjs
  private groupSltd
  private visiObj
  private animPause
  private pauseAnimGrp
  private rev 
  private obName
  private comxCap
  private comxCapSub
  public minMax
  public moduleAction
  private calibId
  private testId
  public vidPath
  public testVid
  public calibVid

constructor(private modelService: ModelService, private router:Router,private activatedRoute: ActivatedRoute,private renderWeb:Renderer2,    private modalService: NgbModal) {
  
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.webEnable = true;
  if ( WEBGL.isWebGLAvailable() ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true  //alpha: true 
    });  
  }else {  
    const warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild( warning ); 
    this.webEnable = false;
  }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true  //alpha: true 
    }); 
    this.composerLoad = this.iniLoad = true; 
    this.minMax = this.rev = this.animPause = this.mouseDrag = false;
    this.cam = 0;
   
    this.navButtons = ['<i class="fa fa-backward"></i>','<i class="fa fa-undo"></i>','<i aria-hidden="true" class="fa fa-play" id="re-play"></i>','<i class="fa fa-pause" aria-hidden="true"></i>','<img src="/assets/img/resume_btn.png" height=20 width=20>']
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock(); 
    this.camera =  new THREE.PerspectiveCamera( 25, window.innerWidth / 
    window.innerHeight );//new THREE.PerspectiveCamera(null,null,null,null);      
    this.composer; 
    [this.animationClip , this.modelData ,this.modelGrps] = [[],[],[]];
    [this.comxCapSub , this.visiObj, this.controlData, this.animMixerCallbacks, this.pauseAnimGrp] = [[],[],[],[],[]]
    this.cntBtn = {}
  }

 /**
 * @function : Dialog Model
 * @called : video pop up for testing & caliber
 */   
  open() { 
    const modalRef = this.modalService.open(NgbdModalContent,{ centered: true, size: 'xl'});
    let htmlPath = this.modelData.data[0].data.find(row=>row.language == this.htmlLang).path;
    
    modalRef.componentInstance.videoSrc = '/assets/video/'+this.vidPath+'.mp4'             
  }

/**
 * @function :Angular life cycle hook 
 * @called :after ng directive load data
 */  


async ngOnInit() { 
  
  if (this.webEnable){
      this.progressBar = document.getElementById('progressBar') as HTMLDivElement;
      this.handler = document.querySelector('.handler') as HTMLDivElement;
      this.wrapper = this.handler.closest('.wrapper') as HTMLDivElement;
      this.boxA = this.wrapper.querySelector('.box') as HTMLDivElement;
      this.isHandlerDragging = false;

      let allModel:any = await new Promise(resolve => this.modelService.getModel().subscribe(response => {
        resolve(response) 
      }));
      
      this.htmlLang = localStorage.getItem('frontLang') ? localStorage.getItem('frontLang') : 'en'
      this.cntBtn = langBtns[this.htmlLang]

      if (allModel.data.length > 0){
            this.activeModelID = this.activatedRoute.firstChild ? this.activatedRoute.firstChild.snapshot.paramMap.get('modelID') : null
            if(!this.activeModelID) {
              let sortArr = []
              allModel.data.forEach(row => { 
                if(row.status) sortArr.push(row)
              })   
              sortArr.sort(function (a, b) {
                return a.order - b.order
              })              
              this.activeModelID =  sortArr[0]._id;    
            }
          
            this.modelData = await new Promise(resolve => this.modelService.getModelById(this.activeModelID).subscribe(response => {
              resolve(response) 
            }));
            
            console.log("Current Model",this.modelData);   
            //get environment
            if (this.modelData.data[0].environmentFile) {
                this.rgbLoader  = new RGBELoader();
                this.rgbLoader.setPath( this.modelData.data[0].path + "/");       
               this.texture = await new Promise(resolve => this.rgbLoader.load(this.modelData.data[0].environmentFile, texture => resolve(texture)));
                await this.loadHdr();           
            }
              //get annotation csv data  
              await this.getControlData(); 
            
              await this.navButtonsAdd();    
       
              // draco
              const draco = new DRACOLoader()
              draco.setDecoderPath('../node_modules/three/examples/js/libs/draco/gltf/');
              draco.setDecoderConfig({ type: 'js' });
              const dracoLoader = draco;

              // gltf
              const gltf = new GLTFLoader();
              gltf.setDRACOLoader( dracoLoader );
              const loader = gltf;
              //   const loader = new GLTFLoader()
              loader.setPath( this.modelData.data[0].path+"/" );  
              this.model  = await new Promise(resolve => loader.load(this.modelData.data[0].model, gltf => resolve(gltf)));
                            
              this.model.scene.traverse( ( o ) =>  {        
                if ( o.isMesh ) {      
                   this.visiObj.push(o.name)
                  }
              })
              this.scene.add( this.model.scene )   

              //animation
              this.model.animations.forEach(a => { 
                 this.animationClip.push(a.name)
              }) 
            
              this.getCanvas()
              this.init();  
              const capid= this.activatedRoute.firstChild ? this.activatedRoute.firstChild.snapshot.queryParamMap.get('capterId') : null
              
              if(capid)this.iotCapterLink(capid);

          }else {
              this.container = document.createElement( 'div' );
              this.container.style.height = (screen.width*45/100)+"px"
              this.container.innerHTML = '<div style="width: 29%;position: absolute;top: 50%;transform: translate(0, -50%);"><h3 style="position: absolute;top: 50%;left: 30%;transform: translate(0, -50%);border: 5px solid #FFFF00;padding: 10px;color: #000;font-size: 18px;">No Model Added.</h3></div>';
              document.querySelector('.imanual-app').appendChild( this.container ); 
              this.progressBar.style.visibility = "hidden"
              let modelapp: HTMLDivElement = document.querySelector(".imanual-app") as HTMLDivElement
              modelapp.style.visibility =  "visible"
          }
      }                
}
/**
 * @function :Set environment for model
 */
loadHdr = async () => {
  this.pmremGenerator = new THREE.PMREMGenerator( this.renderer );
  this.pmremGenerator.compileEquirectangularShader();      
  this.envMap = this.pmremGenerator.fromEquirectangular( this.texture ).texture;
  this.scene.environment = this.envMap;
  this.texture.dispose();
  this.pmremGenerator.dispose();                      
  this.envMap = this.envMap;  
}

/**
 * @function :Outline composer to 
 * show outline (Highlight)
 */
initComposer = async () => {    
  this.composer = new EffectComposer(this.renderer);
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.composer.addPass(this.renderPass);
  this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
  this.camera.updateProjectionMatrix();
  this.composer.setSize( this.container.clientWidth, this.container.clientHeight );
}

/**
 * @function :Get control data 
 * from control file for -
 * @animations
 * @capters name
 * @html view 
 */
  getControlData = async () => {   

      let xmlPromise = new Promise((resolve, reject) => {
        const xmlDownload = new XMLHttpRequest()        
        xmlDownload.open('GET', `${this.modelData.data[0].path}/control.json`,false)
        xmlDownload.send();        
          if (xmlDownload.readyState === 4) {
            return resolve(xmlDownload.responseText);
          }                
      })
      xmlPromise.then((response:string) => {
        this.controlData = JSON.parse(response)
        
        this.viewState = []
          let [mGrp,sGrp,clab,gSltd] = [[],[],[],[]]    
          if (!Array.isArray(this.controlData.scene.viewstate.state)){
              this.viewState[this.controlData.scene.viewstate.state._name] = this.controlData.scene.viewstate.state.__cdata ? this.controlData.scene.viewstate.state.__cdata.split(',') : []  
          }else{  
            this.controlData.scene.viewstate.state.forEach(state => {         
            this.viewState[state._name] = state.__cdata ? state.__cdata.split(',') : []                     
            })
          }
        //get groups of model's objects
        if (!Array.isArray(this.controlData.scene.groups.grp)){
          if(this.controlData.scene.groups.grp._selectable == "true")
            gSltd[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp._link

            mGrp[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp._link
            sGrp[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp._id

            if ( this.htmlLang == 'en' ) {
                clab[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp['_label']
            }else if(this.htmlLang == 'de') {
                clab[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp['_label-de'] 
            }else if(this.htmlLang == 'es') {
                clab[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp['_label'] 
            }else if(this.htmlLang == 'zh'){
              clab[this.controlData.scene.groups.grp._name] = this.controlData.scene.groups.grp['_label'] 
            }
          
          }else{  
            this.controlData.scene.groups.grp.forEach(group => { 

            if(group._selectable == "true")
            gSltd[group._name] = group._link

            mGrp[group._name] = group._link
            sGrp[group._name] = group._id

            if ( this.htmlLang == 'en' ) {
              clab[group._name] = group['_label']
            }else if(this.htmlLang == 'de') {
              clab[group._name] = group['_label-de'] 
            }else if(this.htmlLang == 'es') {
                clab[group._name] = group['_label'] 
            }else if(this.htmlLang == 'zh'){
                clab[group._name] = group['_label'] 
            }

          })
        }
        
          this.stateObjs = sGrp
          this.modelGrps = mGrp
          this.groupSltd = gSltd
          this.capterLabel = clab
          
      })
}


/**
 * @function :Get model canvas
 */

getCanvas = async () => {
    this.container = document.createElement( 'div' );
    this.container.style.height = (screen.width*45/100)+"px"
    document.querySelector('.imanual-app').appendChild( this.container ); 
}


/** 
* @function :Initialise model components
*/
init = async () => { 
  console.log('model',this.model)
  //this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
  this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

  this.camera.position.set( 4, 4, 4  );

 

  this.scene.background = new THREE.Color( 0xa0a0a0 );

  // this.scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

 const light = new THREE.HemisphereLight( 0xffffff );

  light.position.set( 10, 10, 10 );

  this.scene.add( light );

 const light2 = new THREE.DirectionalLight( 0xffffff );

 light2.position.set( 0, 200, 100 );

 light2.castShadow = true;

//  light2.shadow.camera.top = 180;

//  light2.shadow.camera.bottom = - 100;

//  light2.shadow.camera.left = - 120;

//  light2.shadow.camera.right = 120;

  this.scene.add( light2 );

    //load composer 
 //   this.composer = new EffectComposer( this.renderer );

      if (this.composerLoad) { 
         this.initComposer()
       }         
                                                                        
        this.renderer.setPixelRatio( window.devicePixelRatio );          
        this.container.appendChild( this.renderer.domElement );
                              
      if(this.iniLoad) {     
        this.iniLoad = false
        window.addEventListener( 'resize', this.onWindowResize.bind(Event, this.model), false)
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );     
        this.controls.addEventListener( 'change', this.changeEvent );    
        this.controls.update();
        this.controls.enablePan = true;
        this.controls.enableDamping = false;    

        this.container.addEventListener('click', this.onClick.bind(Event, this.model), false);
        this.container.addEventListener('touchstart', this.onTouchDevice.bind(Event, this.model), false);
        this.container.addEventListener('pointermove', this.onMouseMove.bind(Event), false);
        this.container.addEventListener('pointerdown', this.onMouseDown.bind(Event), false);
        this.container.addEventListener('pointerup', this.onMouseUp.bind(Event), false);
        
        this.handler.addEventListener('pointermove', this.dragResize.bind(Event), false);
        this.handler.addEventListener('touchmove', this.dragResizeDevice.bind(Event), false);
        document.addEventListener('pointerdown', this.dragDown.bind(Event), false);
        document.addEventListener('pointerup', this.dragUp.bind(Event), false);

        this.container.addEventListener('wheel',this.onMouseWheel.bind(Event), false);  
        this.initialResize();
        this.renderLoad();   
      }else{
          this.render();
      }           
}

/**  
 * @function :Intial resize model on load
 */
initialResize = () => { 
  let incDev = window.innerWidth*5/100  
  this.container.style.height = window.innerHeight-50+"px";
  this.camera.aspect = ((window.innerWidth)/2-incDev) / (window.innerHeight-50);
  this.camera.updateProjectionMatrix();
  this.renderer.setSize( ((window.innerWidth)/2-incDev), window.innerHeight-50 );
}

/**
 * @function :On mouse down resize handler
 * @param :event 
 */
dragDown = (event:any) => {
  if (event.target === this.handler) {
    this.isHandlerDragging = true;
  }
}

/**
 * @function :On drag on resize handler
 * @param :event 
 */
dragUp = (event:any) => {
  this.isHandlerDragging = false  
  this.render();
}

/**
 * @function :Resize window on resize event
 * @param :event 
 */
dragResize = (event:any) => {
  if (this.isHandlerDragging) {
     // Get offset
      let containerOffsetLeft = this.wrapper.offsetLeft;
      
    // Get x-coordinate of pointer relative to container
      let pointerRelativeXpos = event.clientX - containerOffsetLeft;
    
    // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
      let boxAminWidth = 5;
      let width = (Math.max(boxAminWidth, pointerRelativeXpos-8))

      this.container.style.height = window.innerHeight-50+"px";
      this.camera.aspect = width / (window.innerHeight-50);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( width, window.innerHeight-50 );
   }
   
}

/**
 * @function : Drag eevent
 * @called : on device draging model and web
 */  
dragResizeDevice = (event:any) => {
  if (this.isHandlerDragging) {
     // Get offset
    let containerOffsetLeft = this.wrapper.offsetLeft;
      
    // Get x-coordinate of pointer relative to container
    let pageX = event.touches[0].clientX 
    let pointerRelativeXpos = pageX - containerOffsetLeft;
    
    // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
      let boxAminWidth = 5;
      let width = (Math.max(boxAminWidth, pointerRelativeXpos-8))

      this.container.style.height = window.innerHeight-50+"px";
      this.camera.aspect = width / (window.innerHeight-50);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( width, window.innerHeight-50 );
   }
}

/**
 * @function :Resize window on resize event
 * @param :model 
 * @param :event 
 */
onWindowResize = (model:any, event: MouseEvent) => {  
  let incDev = window.innerWidth*5/100 
  this.container.style.height = window.innerHeight-50+"px";
  this.camera.aspect = ((window.innerWidth)/2-incDev) / (window.innerHeight-50);
  this.camera.updateProjectionMatrix();
  this.renderer.setSize( ((window.innerWidth)/2-incDev), window.innerHeight-50 );
  this.render();
}

/**
* @function :Navigation buttons add
*/
navButtonsAdd = () => {    
        let buttonRef = this;
        const animationBack: HTMLDivElement = document.getElementById("back-animation") as HTMLDivElement
        const button: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
        button.className = "btn-cstm btn-2 action-text"
        button.innerHTML = '<img src="/assets/img/Icon-installation.png"><span>'+this.cntBtn.reversePlay+'</span>'       
        button.addEventListener('click', buttonRef.clickAction.bind(Event, 'Back'), false);
        animationBack.appendChild(button);
   
        const replay: HTMLDivElement = document.getElementById("replay") as HTMLDivElement
        const buttonReplay: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
        buttonReplay.className = "btn-cstm btn-1 action-text"
        buttonReplay.innerHTML = '<img src="/assets/img/Icon-removal.png"><span>'+this.cntBtn.repAnimation+'</span>'    
        buttonReplay.addEventListener('click', buttonRef.clickAction.bind(Event, 'Replay'), false);
        replay.appendChild(buttonReplay);

        const reset: HTMLDivElement = document.getElementById("reset-zoom") as HTMLDivElement
        const buttonReset: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
        buttonReset.className = "btn-cstm btn-0 action-text"
        buttonReset.innerHTML = '<img src="/assets/img/Icon-reset.png"><span>'+this.cntBtn.restZoom+'</span>'     
        buttonReset.addEventListener('click', buttonRef.clickAction.bind(Event, 'Reset'), false);
        reset.appendChild(buttonReset);

        const calib: HTMLDivElement = document.getElementById("collaboration") as HTMLDivElement
        calib.addEventListener('click', buttonRef.clickAction.bind(Event, 'Calibration'), false);
        const testing: HTMLDivElement = document.getElementById("testing") as HTMLDivElement
        testing.addEventListener('click', buttonRef.clickAction.bind(Event, 'Testing'), false);

}

/**
 * @function :Play animation
 * @param :animationList 
 */
animationStart = (animationList:any) => {    
let interval = 0; 
let promise = Promise.resolve();
animationList.forEach((clip) => {
  promise = promise.then(() => {
    if(clip._from && clip._to){
    let to = Math.abs(parseInt(clip._to));
    let from = Math.abs(parseInt(clip._from));  
    let view =  clip._view
    interval = clip.duration * 1000 +1000
    console.log('interval', interval)
    this.animationControl('PLAY', this.model.animations, from, to,'LoopOnce', 0.5,
    function() {}, undefined, false, view);
    }
    return new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
    
  });
});

}


/**
 * @function :Play animation in revers
 */
animationBack = () => {
   this.reverse.reverse();                                    
  let interval = 0; 
  let promise = Promise.resolve();
  // this.animationControl('STOP', this.model.animations, null, null, 'AUTO', 1,
  //       function() {}, undefined, false, false);   
  this.reverse.forEach((clip) => {
      promise = promise.then(() => {
        if(clip.r_from && clip.r_to){
        let to = Math.abs(parseInt(clip.r_to));
        let from =  Math.abs(parseInt(clip.r_from)); 
        let view =  clip._view  
        interval = clip.duration * 1000 +1000
        console.log('interval', interval)
        this.animationControl('PLAY', this.model.animations, from, to,'LoopOnce', 0.5,
        function() {}, undefined, false, view);
        }
        return new Promise((resolve) => {
          setTimeout(resolve, interval);
        });
      });
  });
  
  promise.then(() => {   
    this.reverse.reverse();
    });
}

/**
 * @function :Show tool tip
 * @param :latestMouseProjection  
 */
showTooltip = (latestMouseProjection) => { 
  let divElement = document.getElementById('tooltip') as HTMLDivElement;
  if (divElement && latestMouseProjection) {
      divElement.style.display = "block";
      divElement.style.opacity = "0.0";
      let canvasHalfWidth = this.renderer.domElement.offsetWidth/2;
      let canvasHalfHeight = this.renderer.domElement.offsetHeight/2;

      let  tooltipPosition = latestMouseProjection.clone().project(this.camera);
      tooltipPosition.x = (tooltipPosition.x * canvasHalfWidth) + canvasHalfWidth + this.renderer.domElement.offsetLeft;
      tooltipPosition.y = -(tooltipPosition.y * canvasHalfHeight) + canvasHalfHeight + this.renderer.domElement.offsetTop;

      let tootipWidth = divElement.offsetWidth;
      let tootipHeight = divElement.offsetHeight;
      divElement.innerHTML = this.hoverName
      // setTimeout(function() {
      //   divElement.style.opacity = "1.0";
      // }, 25);
    }
}

/**
 * @function :Hide tooltip
 */
hideTooltip = () => {
  var divElement = document.getElementById('tooltip') as HTMLDivElement;
  if (divElement) {
    divElement.style.display = "none";
  }
}

/**
 * @function :On mouse wheel event
 * @param :event 
 */
onMouseWheel = (event: MouseEvent) => {
  this.render();
}

/**
 * @function :Mouse down event
 * @param :event 
 */

onMouseDown = (event: MouseEvent) => {
 this.mouseDrag = true;
 this.hideTooltip();
 this.render();
}

/**
 * @function :Mouse up event
 */
onMouseUp = () => {
  this.mouseDrag= false;
}

/**
 * @function :Mouse move event
 * @param :event 
 * @returns 
 */
onMouseMove = (event: MouseEvent) => {  
        if (this.isHandlerDragging) {
            return false
        }
        this.raycaster.setFromCamera({
          x: (event.offsetX  / this.renderer.domElement.clientWidth) * 2 - 1,
          y: -(event.offsetY  / this.renderer.domElement.clientHeight) * 2 + 1
        }, this.camera);

         let latestMouseProjection;
         let tooltipDisplayTimeout;
                   
        const intersects =  this.raycaster.intersectObjects(this.model.scene.children, true);   
        if (intersects.length > 0) {  
          let controlObj = null
          let getGroupParents = (object:any) => {
            if (this.groupSltd.hasOwnProperty(object.name)){
              controlObj = object
            }else{             
              if(object.parent)
              getGroupParents(object.parent)
            }
          }
          getGroupParents(intersects[0].object)
                //  if (controlObj && this.visiObj.includes(intersects[0].object.name) ){                
                //     latestMouseProjection = intersects[0].point;
                //      this.hoverName = " Object Name => " +intersects[0].object.name + "  <br>  JsonFileGroup => "+ controlObj.name             
                //         if (!tooltipDisplayTimeout && latestMouseProjection) {
                //           let callbackToolTip = this.showTooltip;
                //             tooltipDisplayTimeout = setTimeout(function(this) {
                //             tooltipDisplayTimeout = undefined;
                //             callbackToolTip(latestMouseProjection);
                //           }, 25);
                //         }                                           
                // }else {
                //     this.hideTooltip();
                // }                
              }else {
                  // this.hideTooltip();
              }     
}

/**
 * @function :Click event on model
 * @param :model 
 * @param :event 
 */

iotCapterLink=(id:any)=>{
  let data = [] 
  this.controlData.scene.manual.capter.forEach(capter => { 
  let capId = capter._id
      if(capId==id){
      data.push(capter)   
      }
     })  

     let link
     let devicePanel: HTMLDivElement = document.getElementById("device-panel") as HTMLDivElement 
 
     devicePanel.style.display = "block";
     let ult: HTMLDivElement =  document.getElementById('manual-list')  as HTMLDivElement
     
     if(ult !== null) {
      ult.remove();
     } 
     
     const dropD: HTMLDivElement = document.createElement("DIV") as HTMLDivElement
     dropD.setAttribute("class", "drop-down");
     dropD.setAttribute("id", "manual-list");
     
     const divElem = devicePanel.appendChild(dropD)
     
     const ul: HTMLUListElement = document.createElement("UL") as HTMLUListElement
     ul.setAttribute("class", "drop-ul");
     const ulElem = divElem.appendChild(ul)
     const li: HTMLLIElement = document.createElement("LI") as HTMLLIElement 
   
     if(data.length > 1)
     li.setAttribute("class", "has-submenu");
     const liList = ulElem.appendChild(li);
     const anchor : HTMLAnchorElement = document.createElement("a") as HTMLAnchorElement  
     
     let preCap :string
     if (this.htmlLang == 'en'){
        preCap = data[0]['_name']
     }else if(this.htmlLang == 'de'){
        preCap =  data[0]['_name-de'] ? data[0]['_name-de'] : data[0]['_name']
     }else if(this.htmlLang == 'es'){
        preCap = data[0]['_name-es'] ? data[0]['_name-es'] : data[0]['_name']
     }else if (this.htmlLang == 'zh'){
        preCap =  data[0]['_name-zh'] ? data[0]['_name-zh'] : data[0]['_name']
     }
   
     let title = document.createTextNode( data[0]['_id']+" "+preCap);
     anchor.href = "JavaScript:void(0);"
     anchor.appendChild(title); 
     
    this.showHtmlView(data[0]['_modul'], data[0]['_calibration'],data[0]['_calib-video'],data[0]['_test'],data[0]['_test-video'],data[0]['animation'],data[0]['prerequisites'],data[0]['_state'],data[0]['_name'],data[0]['_name-de'],data[0]['_name-es'],data[0]['_name-zh'],null)
    
    liList.appendChild(anchor);
    //load capterHTML
    this.getHtmlToken.emit(data[0]['_modul'])
            
}

/**
 * @function : Click Event
 * @called : Display model capters
 */  
onClick = async( model:any , event: MouseEvent) =>  {
  
  this.raycaster = new THREE.Raycaster();       
  
  this.raycaster.setFromCamera({
    x: (event.offsetX  / this.renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1
    }, this.camera);

    const intersects =  this.raycaster.intersectObjects(model.scene.children, true);    
      if (intersects.length > 0) { 
         let controlObj = null
          let getGroupParents = (object:any) => {
            if (this.groupSltd.hasOwnProperty(object.name)){
              controlObj = object
            }else{             
              if(object.parent)
              getGroupParents(object.parent)
            }
          }
      
          getGroupParents(intersects[0].object)
               
         
        if (controlObj  && this.visiObj.includes(intersects[0].object.name) ){     
           
                  let activeCapter = [] 
                  if (!Array.isArray(this.controlData.scene.manual.capter)){
                       let capId = this.controlData.scene.manual.capter._id.substring(0, 1);       
                              
                        if(this.groupSltd[controlObj.name] == capId)
                          activeCapter.push(this.controlData.scene.manual.capter)

                  }else {
                      this.controlData.scene.manual.capter.forEach(capter => { 
                      let capId = capter._id.substring(0, 1); 
                                        
                      if(this.groupSltd[controlObj.name] == capId)
                          activeCapter.push(capter)
                  })               
                }
              
                if(activeCapter.length > 0)
                this.diaplayManual(activeCapter,this.capterLabel[controlObj.name])  
                this.obName = controlObj.name
           
          }              
      }   
  }


    /**
 * @function :onTouchDevice event on model
 * @param :model 
 * @param :event 
 * @scope :Device pointer
 */
onTouchDevice = ( model:any , event: TouchEvent) => {
  
  let panelList: HTMLDivElement = document.getElementById("manual-list") as HTMLDivElement 
    if(panelList != null){
       
      if ( panelList.classList.contains("hide")) {
     //   this.renderWeb.removeClass(panelList,"hide");   
      } else {
        panelList.classList.add("hide");
        let openDrop = panelList.querySelector('.open');
        this.renderWeb.removeClass(openDrop,"open"); 
      }  
    }
    this.raycaster = new THREE.Raycaster();  
    let rect = this.renderer.domElement.getBoundingClientRect();

    this.raycaster.setFromCamera({
         x: ((event.targetTouches[0].pageX - rect.left) / rect.width) * 2 - 1,
         y: -((event.targetTouches[0].pageY - rect.top-2) / rect.height) * 2 + 1
     }, this.camera);

    
      const intersects =  this.raycaster.intersectObjects(model.scene.children, true);   

        if (intersects.length > 0) {        
         //formed array of clicks objects with capters
         let controlObj = null
         let getGroupParents = (object:any) => {
           if (this.groupSltd.hasOwnProperty(object.name)){
             controlObj = object
           }else{             
             if(object.parent)
             getGroupParents(object.parent)
           }
         }
     
         getGroupParents(intersects[0].object)
                 
        //formed array of clicks objects with captersfg //
       if (controlObj && this.visiObj.includes(intersects[0].object.name)) {            
                  let activeCapter = [] 
                  if (!Array.isArray(this.controlData.scene.manual.capter)){
                       let capId = this.controlData.scene.manual.capter._id.substring(0, 1);
                       if(this.modelGrps[intersects[0].object.parent.name] == capId)
                        activeCapter.push(this.controlData.scene.manual.capter)
                        
                  }else{
                        this.controlData.scene.manual.capter.forEach(capter => { 
                        let capId = capter._id.substring(0, 1);
                        if(this.modelGrps[intersects[0].object.parent.name] == capId)
                         activeCapter.push(capter)  
                  })               
                }
              if(activeCapter.length > 0)
                this.diaplayManual(activeCapter, this.capterLabel[intersects[0].object.parent.name])  
                this.obName = intersects[0].object.parent.name       
        }              
      }   
}

/**
 * @function : Click Handlers
 * @called : different handler for different events
 */  
clickAction = ( model:any , event: MouseEvent) => {
  const animationResume: HTMLDivElement = document.getElementById("resume") as HTMLDivElement
  const animationPause: HTMLDivElement = document.getElementById("pause") as HTMLDivElement
  
    if(model == 'Reset'){
       this.controls.reset();
       this.render()
    }else if (model == 'Back'){ 
        this.rev = true
       this.getInstallAnim()
    }else if (model == 'Replay'){
        this.rev = false
       this.getRemovalAnim()
    }else if (model == 'Calibration'){    
      this.getHtmlToken.emit(this.calibId)
      if(this.calibVid){
        const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
        config.style.display = "none";
        const vidBtn: HTMLDivElement = document.getElementById("video-cali") as HTMLDivElement
        vidBtn.style.display = "block";
        this.vidPath = this.calibVid
      }
    }else if (model == 'Testing'){    
      this.getHtmlToken.emit(this.testId)
      if(this.testVid){
        const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
        config.style.display = "none";
        const vidTstBtn: HTMLDivElement = document.getElementById("video-test") as HTMLDivElement
        vidTstBtn.style.display = "block";
        this.vidPath = this.testVid
      }
    }
    
}

/**
 * @function : single thread animations
 * @called : providing interface
 */  
getRemovalAnim = () => {
  let mainSec: HTMLDivElement = document.getElementById("installaion") as HTMLDivElement 
  let removalMain: HTMLDivElement = document.getElementById("removal-screen") as HTMLDivElement 
  let installMain: HTMLDivElement = document.getElementById("install-screen") as HTMLDivElement
  let removalScreen: HTMLDivElement = document.getElementById("removal-main") as HTMLDivElement 
    
  if(removalScreen.innerHTML !== ""){
    removalScreen.innerHTML = "";
  } 
  const button: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
  button.className = "btn-cstm btn-2 action-text"
  button.style.float = 'left' 
  button.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i><span class="btnPly">'+this.cntBtn.playAll+'</span>'       
  button.addEventListener('click', this.playSingleThread.bind(Event, 'playAll',null), false);
  removalScreen.appendChild(button);
  let i = 1
  this.replay.forEach((v,k) => {
    const button: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
    button.className = "btn-cstm btn-2 action-text"
    button.innerHTML = '<i class="fa fa-chevron-circle-right" aria-hidden="true"></i><span>'+this.cntBtn.step+' '+i+'</span>'   
    button.style.float = 'left'       
    button.addEventListener('click', this.playSingleThread.bind(Event, k,'far'), false);
    removalScreen.appendChild(button);
    i++;
  });
     
  const buttonReset: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
  buttonReset.className = "btn-cstm btn-2 action-text"
  buttonReset.style.float = 'left' 
  buttonReset.innerHTML = '<img src="/assets/img/Icon-reset.png"><span class="btnPly">'+this.cntBtn.restZoom+'</span>'       
  buttonReset.addEventListener('click', this.clickAction.bind(Event, 'Reset'), false);
  removalScreen.appendChild(buttonReset);

    mainSec.style.display = "none"
    installMain.style.display = "none"
    removalMain.style.display = "block"
}

/**
 * @function : single thread animations 
 * @called : providing interface installation
 */  
getInstallAnim = () => {
  let mainSec: HTMLDivElement = document.getElementById("installaion") as HTMLDivElement 
  let installMain: HTMLDivElement = document.getElementById("install-screen") as HTMLDivElement 
  let installScreen: HTMLDivElement = document.getElementById("install-main") as HTMLDivElement 
  let removalMain: HTMLDivElement = document.getElementById("removal-screen") as HTMLDivElement 
  if(installScreen.innerHTML !== ""){
    installScreen.innerHTML = "";
  } 
  const button: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
  button.className = "btn-cstm btn-2 action-text"
  button.style.float = 'left' 
  button.innerHTML = '<i class="fa fa-backward" aria-hidden="true"></i><span class="btnPly">'+this.cntBtn.reversAll+'</span>'       
  button.addEventListener('click', this.playSingleThread.bind(Event, 'reversAll',null), false);
  installScreen.appendChild(button);
  let i = this.replay.length
  this.replay.forEach((v,k) => {
    const button: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
    button.className = "btn-cstm btn-2 action-text"
    button.innerHTML = '<i class="fa fa-chevron-circle-left" aria-hidden="true"></i><span>Step '+i+'</span>'   
    button.style.float = 'left'       
    button.addEventListener('click', this.playSingleThread.bind(Event, i-1,'rev'), false);
    installScreen.appendChild(button);
    i--;
  });
    
  const buttonReset: HTMLButtonElement = document.createElement("BUTTON") as HTMLButtonElement
  buttonReset.className = "btn-cstm btn-2 action-text"
  buttonReset.style.float = 'left' 
  buttonReset.innerHTML = '<img src="/assets/img/Icon-reset.png"><span class="btnPly">'+this.cntBtn.restZoom+'</span>'       
  buttonReset.addEventListener('click', this.clickAction.bind(Event, 'Reset'), false);
  installScreen.appendChild(buttonReset);
    
    mainSec.style.display = "none"
    removalMain.style.display = "none"
    installMain.style.display = "block" 
}

/**
 * @function : animations handling single thread
 * @called : different animations process
 */  
playSingleThread = (anim:any,type:string,event:Event) => {
  if (anim == "playAll") {
    this.animationStart(this.replay)
  }else if (anim == "reversAll") {
     this.animationBack()
  }else {
    let thread = this.replay[anim]
      if(thread._to && thread._from){
      type == "rev" ? this.animationControl('PLAY', this.model.animations, Math.abs(parseInt(thread.r_from)), Math.abs(parseInt(thread.r_to)), 'LoopOnce', 0.5,
      function() {}, undefined, false, thread._view) :  this.animationControl('PLAY', this.model.animations, thread._from, thread._to,'LoopOnce', 0.5,
       function() {}, undefined, false, thread._view)    
    }
  }
}

/**
 * @function : interface install & removal
 * @called : hide show interface
 */  
loadAnimMain = () => {
  let mainSec: HTMLDivElement = document.getElementById("installaion") as HTMLDivElement 
  let installMain: HTMLDivElement = document.getElementById("install-screen") as HTMLDivElement 
  let removalMain: HTMLDivElement = document.getElementById("removal-screen") as HTMLDivElement 
    mainSec.style.display = "block"
    removalMain.style.display = "none"
    installMain.style.display = "none" 
}

/** 
   @function : Display control.json capter's manual
   @capters  : component list
   @capters  : name
   @capters  : topicId
   @param    : capter
*/
diaplayManual = ( capter:any[], capterLab:string ) => {
    let link
    let devicePanel: HTMLDivElement = document.getElementById("device-panel") as HTMLDivElement 
    devicePanel.style.display = "block";
    let ult: HTMLDivElement =  document.getElementById('manual-list')  as HTMLDivElement
    if(ult !== null) {
      ult.remove();
    } 

    this.comxCap = []
    let level = 2;
    capter.forEach(li => {
      if(li['_id'].split(".").length > level ){
        this.seriesCaps(li)
      }else {
        li.sub = []
        this.comxCap.push(li)
      } 
    })
  
    const dropD: HTMLDivElement = document.createElement("DIV") as HTMLDivElement
    dropD.setAttribute("class", "drop-down");
    dropD.setAttribute("id", "manual-list");
    
    const divElem = devicePanel.appendChild(dropD)
    const ul: HTMLUListElement = document.createElement("UL") as HTMLUListElement

    ul.setAttribute("class", "drop-ul");
    const ulElem = divElem.appendChild(ul)
    const li: HTMLLIElement = document.createElement("LI") as HTMLLIElement 
  
    if(this.comxCap.length > 1)
    li.setAttribute("class", "has-submenu");

    const liList = ulElem.appendChild(li);
    const anchor : HTMLAnchorElement = document.createElement("a") as HTMLAnchorElement  
    
    let preCap :string
    if (this.htmlLang == 'en'){
       preCap = this.comxCap[0]['_name']
    }else if(this.htmlLang == 'de'){
       preCap =  this.comxCap[0]['_name-de'] ? this.comxCap[0]['_name-de'] : this.comxCap[0]['_name']
    }else if(this.htmlLang == 'es'){
       preCap = this.comxCap[0]['_name-es'] ? this.comxCap[0]['_name-es'] : this.comxCap[0]['_name']
    }else if (this.htmlLang == 'zh'){
       preCap =  this.comxCap[0]['_name-zh'] ? this.comxCap[0]['_name-zh'] : this.comxCap[0]['_name']
    }

    let title = document.createTextNode( this.comxCap[0]['_id']+" "+preCap);
    anchor.href = "JavaScript:void(0);"

    anchor.appendChild(title); 
    anchor.addEventListener('click', this.showHtmlView.bind(Event, this.comxCap[0]['_modul'],this.comxCap[0]['_calibration'],this.comxCap[0]['_calib-video'],this.comxCap[0]['_test'],this.comxCap[0]['_test-video'],this.comxCap[0]['animation'],this.comxCap[0]['prerequisites'],this.comxCap[0]['_state'],this.comxCap[0]['_name'],this.comxCap[0]['_name-de'],this.comxCap[0]['_name-es'],this.comxCap[0]['_name-zh']), false);
    liList.appendChild(anchor);
    const ulSubList: HTMLUListElement = document.createElement("UL") as HTMLUListElement
    ulSubList.setAttribute("class", "submenu");
    const ulElemsub =  liList.appendChild(ulSubList);
    let i=0
    this.comxCap.forEach(arr => { 
        const liFr: HTMLLIElement = document.createElement("LI") as HTMLLIElement  
        if(arr['sub'].length > 0){
          liFr.setAttribute("class", "has-submenu");
        } 
        const liElem = ulElemsub.appendChild(liFr);
        if(i!=0){
          const anchor : HTMLAnchorElement = document.createElement("a") as HTMLAnchorElement  
          preCap = ''
          if (this.htmlLang == 'en'){
            preCap = arr['_name']
         }else if(this.htmlLang == 'de'){
            preCap =  arr['_name-de'] ? arr['_name-de'] : arr['_name']
         }else if(this.htmlLang == 'es'){
            preCap = arr['_name-es'] ? arr['_name-es'] : arr['_name']
         }else if (this.htmlLang == 'zh'){
            preCap =  arr['_name-zh'] ? arr['_name-zh'] : arr['_name']
         }

          let title = document.createTextNode(arr['_id']+" "+preCap);
          anchor.appendChild(title); 
          anchor.addEventListener('click', this.showHtmlView.bind(Event, arr['_modul'],arr['_calibration'],arr['_calib-video'],arr['_test'],arr['_test-video'],arr['animation'],arr['prerequisites'],arr['_state'],arr['_name'],arr['_name-de'],arr['_name-es'],arr['_name-zh']), false)
          liElem.appendChild(anchor);
        }

      if(arr['sub'].length > 0){
        const ulSub: HTMLUListElement = document.createElement("UL") as HTMLUListElement
        ulSub.setAttribute("class", "submenu");       
        const ulElemsub =  liElem.appendChild(ulSub);
        arr['sub'].forEach(arrSub => {
           const liSub: HTMLLIElement = document.createElement("LI") as HTMLLIElement
           const liElemSub = ulElemsub.appendChild(liSub)
           const anchorSub : HTMLAnchorElement = document.createElement("a") as HTMLAnchorElement  
           let preCapSub
           if (this.htmlLang == 'en'){
            preCapSub = arrSub['_name']
          }else if(this.htmlLang == 'de'){
            preCapSub =  arrSub['_name-de'] ? arrSub['_name-de'] : arrSub['_name']
          }else if(this.htmlLang == 'es'){
            preCapSub = arrSub['_name-es'] ? arrSub['_name-es'] : arrSub['_name']
          }else if (this.htmlLang == 'zh'){
            preCapSub =  arrSub['_name-zh'] ? arrSub['_name-zh'] : arrSub['_name']
          }
           let title = document.createTextNode(arrSub['_id']+" "+preCapSub);
           anchorSub.href = "JavaScript:void(0);"           
            anchorSub.appendChild(title); 
           anchorSub.addEventListener('click', this.showHtmlView.bind(Event, arrSub['_modul'],arrSub['_calibration'],arrSub['_calib-video'],arrSub['_test'],arrSub['_test-video'],arrSub['animation'],arrSub['prerequisites'],arrSub['_state'],arrSub['_name'],arrSub['_name-de'],arrSub['_name-es'],arrSub['_name-zh']), false);
           liElemSub.appendChild(anchorSub);
         })
      }
      i++
    })
}

/** 
   @function : handle toggle capters
   @param    : events
*/
toggleOpen = (event:any ) => {
  this.renderWeb.addClass(event.target.parentElement,"open");
}

toggleClose = (event:any ) => {
  this.renderWeb.removeClass(event.target.parentElement,"open"); 
}

seriesCaps = (li:any) => {
  let liSP = li['_id'].split(".")
  let i=0;
  let na = []
  this.comxCap.forEach(liCaps => {
    let idSP = liCaps['_id'].split(".")
    if(idSP[1] == liSP[1] && (liSP.length - idSP.length == 1)){
      this.comxCap[i]['sub'].push(li)
  } 
 i++
 }) 
}

/** 
* @function : On click capters perform actions
* @show html 
* @play animations
*/

showHtmlView = (action:string, calibration:string, calibVid:string, testing:string, testVid:string,animationList:any[],  prerequisites:any[],module:string, name:string, nameDe:string, nameEs:string=null, nameZh:string=null, event:any ) => {
  let capTitle: HTMLDivElement = document.getElementById("caps-section") as HTMLDivElement
  let capInner: HTMLDivElement = document.getElementById("cap-sec") as HTMLDivElement

  let capsText
    if (this.htmlLang == 'en'){
      capsText = name
    }else if(this.htmlLang == 'de'){
      capsText =  nameDe ? nameDe : name
    }else if(this.htmlLang == 'es'){
      capsText = nameEs ? nameEs : name
    }else if (this.htmlLang == 'zh'){
        capsText =  nameZh ? nameZh : name
    }
 
    capInner.innerHTML = '<span class=caps-name>'+capsText+'</span>'
    capInner.style.display = "block"
    if(event){
      if(event.target.parentElement.classList.contains("open")){
        this.renderWeb.removeClass(event.target.parentElement,"open");
      }else{
        this.renderWeb.addClass(event.target.parentElement,"open");
      }
    }
    let preReq: HTMLDivElement = document.getElementById("prerequisites") as HTMLDivElement
    preReq.style.display = "none"
    if(prerequisites){
      this.showPreCaps(prerequisites,name,nameDe);
    }else {
      let ultPre: HTMLUListElement =  document.getElementById('pre-list')  as HTMLUListElement
      if(ultPre !== null){
        ultPre.remove();
      } 
    }
 
  this.loadViewState(module)
  

  this.moduleAction = action
  const calib: HTMLDivElement = document.getElementById("collaboration") as HTMLDivElement
  calib.style.display = 'none'
  if (calibration){
     calib.style.display = 'block'
     this.calibId = calibration
     this.calibVid = calibVid
   }

   const testPasge: HTMLDivElement = document.getElementById("testing") as HTMLDivElement
   testPasge.style.display = 'none'
  if (testing){
     testPasge.style.display = 'block'
     this.testId = testing
     this.testVid = testVid
   }
  
  const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
  config.style.display = "block";

  const iniLoad: HTMLDivElement = document.getElementById("state-init") as HTMLDivElement
  iniLoad.style.display = "block";

  const insideLoad: HTMLDivElement = document.getElementById("state-in") as HTMLDivElement
  insideLoad.style.display = "none";

  let install: HTMLDivElement =  document.getElementById('installaion')  as HTMLDivElement
  install.style.display = "none"
 

  const vidBtn: HTMLDivElement = document.getElementById("video-cali") as HTMLDivElement
  vidBtn.style.display = "none";

  const vidTsBtn: HTMLDivElement = document.getElementById("video-test") as HTMLDivElement
  vidTsBtn.style.display = "none";

  let installMain: HTMLDivElement = document.getElementById("install-screen") as HTMLDivElement 
  let removalMain: HTMLDivElement = document.getElementById("removal-screen") as HTMLDivElement 

  removalMain.style.display = "none"
  installMain.style.display = "none" 

  this.replay = this.reverse = animationList

  let panelList: HTMLDivElement = document.getElementById("manual-list") as HTMLDivElement 
  if(panelList != null){
    if(panelList.classList.contains("hide")){
      this.renderWeb.removeClass(panelList,"hide");   
    }
  }
  
}

/** 
   @function : providing interface
   @called   : installation section
*/
installStart = () => {
   this.getHtmlToken.emit(this.moduleAction)
   let install: HTMLDivElement =  document.getElementById('installaion')  as HTMLDivElement
   install.style.display = "block"

   const replayAction: HTMLButtonElement = document.getElementById("replay") as HTMLButtonElement
   replayAction.style.display = "block";

   const animationBack: HTMLDivElement = document.getElementById("back-animation") as HTMLDivElement
   animationBack.style.display = "block";

   const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
   config.style.display = "none";


  const vidBtn: HTMLDivElement = document.getElementById("video-cali") as HTMLDivElement
  vidBtn.style.display = "none";

  const vidTstBtn: HTMLDivElement = document.getElementById("video-test") as HTMLDivElement
  vidTstBtn.style.display = "none";
}

/** 
   @function : providing interface
   @called   : load main state
*/
loadPrevious = () => {
  let install: HTMLDivElement =  document.getElementById('installaion')  as HTMLDivElement
  install.style.display = "none"

  const vidBtn: HTMLDivElement = document.getElementById("video-cali") as HTMLDivElement
  vidBtn.style.display = "none";

  const vidTstBtn: HTMLDivElement = document.getElementById("video-test") as HTMLDivElement
  vidTstBtn.style.display = "none";

  const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
  config.style.display = "block";
}

/** 
   @function : explore model
   @called   : model explore view toggle
*/
explodeView = () => {
  const minmax: HTMLButtonElement = document.getElementById("minMaxS") as HTMLButtonElement
  let animView = []
  if (!Array.isArray(this.controlData.scene.manual.capter)){
    if (this.controlData.scene.manual.capter._name)                   
      animView = this.controlData.scene.manual.capter['animation']
  }else {
    this.controlData.scene.manual.capter.forEach(capter => { 
      if (capter._name == 'explode') animView = capter['animation']                       
  })               
  }
  if (!this.minMax){
        minmax.innerHTML = '<img src="/assets/img/Icon-minimize.png">'    
        this.minMax = true
        animView.forEach(list => 
          {           
          if(list._name == 'separate') {          
            let to = Math.abs(parseInt(list._to));
            let from = Math.abs(parseInt(list._from));
            this.animationControl('PLAY', this.model.animations, from, to,'LoopOnce', 0.5,
            function() {}, undefined, false, list._view);
          }
        })
  }else { 
    minmax.innerHTML = '<img src="/assets/img/Icon-maximize.png">'
    this.minMax = false
    animView.forEach(list => 
      {  
      if(list._name == 'join') {
        let to = Math.abs(parseInt(list._to));
        let from = Math.abs(parseInt(list._from));
        this.animationControl('PLAY', this.model.animations, from, to,'LoopOnce', 0.5,
        function() {}, undefined, false, list._view);
      }
    })
  }
}

/** 
   @function : model object display
   @param   : model object
*/
loadViewState = (moduleState:string) => {
  const minmax: HTMLButtonElement = document.getElementById("minMaxS") as HTMLButtonElement
  if(moduleState == 'initial') {
    

        const videoTest: HTMLDivElement = document.getElementById("video-test") as HTMLDivElement
        videoTest.style.display = "none"

        const videoCali: HTMLDivElement = document.getElementById("video-cali") as HTMLDivElement
        videoCali.style.display = "none"

        const iniLoad: HTMLDivElement = document.getElementById("state-init") as HTMLDivElement
        iniLoad.style.display = "none"

        const insideLoad: HTMLDivElement = document.getElementById("state-in") as HTMLDivElement
        insideLoad.style.display = "block"

        const config: HTMLDivElement = document.getElementById("config") as HTMLDivElement
        config.style.display = "none"

        let install: HTMLDivElement =  document.getElementById('install-screen')  as HTMLDivElement
        install.style.display = "none"

        let installMain: HTMLDivElement =  document.getElementById('installaion')  as HTMLDivElement
        installMain.style.display = "none"

        let panel: HTMLDivElement =  document.getElementById('device-panel')  as HTMLDivElement
        panel.style.display = "none"

        let removal: HTMLDivElement =  document.getElementById('removal-screen')  as HTMLDivElement
        removal.style.display = "none"
        
     
        minmax.innerHTML = '<img src="/assets/img/Icon-maximize.png">'
        this.minMax = false

  }
  
  let statObjs = []
  for (let key in this.modelGrps) {
    
    if(this.viewState[moduleState])
    if(this.viewState[moduleState].includes(this.stateObjs[key])){
      statObjs.push(key)
    }
  } 
  
  let model = this.model
  
  model.scene.traverse( ( o ) =>  {     
    
    if ( o.isMesh ) {      
        o.visible = false
      }
  })
  this.visiObj = []
  this.loadStateModule(statObjs); 
}

/** 
   @function : maintain object visiblity
   @called  : model hide and show
*/
loadStateModule = async(loadMods:any[]) => {
  let model = this.model
  if(loadMods.length !== 0) { 
    loadMods.forEach(row => { 
    let gp = this.model.scene.getObjectByName(row);  
    if(gp){
     gp.traverse( ( o ) =>  {        
      if ( o.isMesh ) { 
          o.visible = true           
          this.visiObj.push(o.name)     
        }else if (o.isGroup){
         if(gp.name != o.name){
            let grpAr = []
            grpAr.push(o.name)
            this.loadStateModule(grpAr)
          }
        }
    }) 
  }
  })
  }else { 
    this.model.scene.traverse( ( o ) =>  {        
      if ( o.isMesh ) {      
           o.visible = true
           this.visiObj.push(o.name)
          }
        })
        let promise = Promise.resolve();
        this.obName = 'initial'
        let interval = 800
            promise = promise.then(() => {
              this.animationControl('STOP', this.model.animations, null, null, 'AUTO', 1,
              function() {}, undefined, false, false);
              this.animationControl('PLAY', this.model.animations, 0, 0,'LoopOnce', 1,
              function() {}, undefined, false,false);
              return new Promise((resolve) => {
                setTimeout(resolve, interval);
              });
            }).then(() => { 
              this.controls.reset();
            });   
  }
  this.render();
}

/** 
   @function : providing interface
   @called  : binding capters properties
*/
showPreCaps = (prerequisites:any[],name:string,nameDe:string) => {
  let preReq: HTMLDivElement = document.getElementById("prerequisites") as HTMLDivElement
  let preDiv: HTMLDivElement = document.getElementById("pre-sec") as HTMLDivElement
 
  let ultPre: HTMLUListElement =  document.getElementById('pre-list')  as HTMLUListElement
  if(ultPre !== null){
    ultPre.remove();
  } 
  preDiv.innerHTML = '<img src="/assets/img/gruppe_36.png">'
  const ulPre: HTMLUListElement = document.createElement("UL") as HTMLUListElement
  ulPre.setAttribute("id", "pre-list");
  const ulElemPre = preDiv.appendChild(ulPre)
  if (!Array.isArray(prerequisites)){
     let arr = []
     arr.push(prerequisites)
     prerequisites = arr
  }
  if(prerequisites){
     prerequisites.forEach(arr => {
        const liPre: HTMLLIElement = document.createElement("LI") as HTMLLIElement
        const liElemSub = ulElemPre.appendChild(liPre)
      //  const dropD: HTMLDivElement = document.createElement("DIV") as HTMLDivElement
      let preTxt
      if(arr['_des']){
      if (this.htmlLang == 'en'){
            preTxt =  arr['_des']
            }else if(this.htmlLang == 'de'){
              preTxt =  arr['_des-de'] ? arr['_des-de'] : arr['_des']
            }else if(this.htmlLang == 'es'){
              preTxt =  arr['_des-es'] ? arr['_des-es'] :  arr['_des']
            }else if (this.htmlLang == 'zh'){
              preTxt =  arr['_des-zh'] ? arr['_des-zh'] : arr['_des']
            }
        }else {
            preTxt = arr['__cdata']
      }

      liElemSub.innerHTML = preTxt;
    })

  const anchorSub : HTMLAnchorElement = document.createElement("a") as HTMLAnchorElement  
  let title = document.createElement("I") 
  title.addEventListener('click', this.loadPrevious.bind(Event));
  title.setAttribute('class',"cross-warning")
  title.setAttribute('aria-hidden',"true")
  anchorSub.href = "JavaScript:void(0);"
  anchorSub.setAttribute("class", "close-bar");
  anchorSub.appendChild(title); 
  preDiv.appendChild(anchorSub);
  preReq.style.display = "block"
  
 }
}

/**
 * @function :Remove capter's manual
 */
removeComponentDetails = () => {
  let ult: HTMLUListElement =  document.getElementById('manual-list')  as HTMLUListElement
  ult.remove();
  let devicePanel: HTMLDivElement = document.getElementById("device-panel") as HTMLDivElement
  devicePanel.style.display = "none";
}

/**
 * @function :Capter's manual toggling
 */
toggleComponentDetails = () => {
  let ult: HTMLUListElement =  document.getElementById('manual-list')  as HTMLUListElement
  let toggleOn =  document.getElementById('toggle-on')  as HTMLElement
  let toggleOff =  document.getElementById('toggle-off')  as HTMLElement

  if (ult.style.display === "none") {
    ult.style.display = "block";
  } else {
    ult.style.display = "none";
  }

  if (toggleOn.style.display === "none") {
    toggleOn.style.display = "block";
  } else {
    toggleOn.style.display = "none";
  }

  if (toggleOff.style.display === "none") {
     toggleOff.style.display = "block";
  } else {
     toggleOff.style.display = "none";
  }
 
}

/**
 * @function :Convert xml to json
 * @param :xml 
 * @returns 
 */
xmlJSON(xml) {
var obj:any = {};
if (xml.nodeType == 1) { // element
  // do attributes
  if (xml.attributes.length > 0) {
  obj["_attributes"] = {};
    for (var j = 0; j < xml.attributes.length; j++) {
      var attribute = xml.attributes.item(j);
      obj["_attributes"][attribute.nodeName] = attribute.nodeValue;
    }
  }
} else if (xml.nodeType == 3) { // text
  obj = xml.nodeValue;
}

// do children
if (xml.hasChildNodes()) {
    for(var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = this.xmlJSON(item);
      } else {
        if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
        }
        obj[nodeName].push(this.xmlJSON(item));
      }
    }
  }
    return obj;
}

 /**
  * @function :Also can be used to fetch image textures
  * @param :model  
  * @param :envMap 
  * @scope :can be used 
  * with image textures
  * @returns 
  */
 
loadTexturesModel = async (model:any, envMap:any)  => {
  const manager = new THREE.LoadingManager();
  let roughnessMipmapper = new RoughnessMipmapper( this.renderer);
  const textureLoader = new THREE.TextureLoader(manager);           
      model.traverse( ( o ) =>  {   
        if ( o.isMesh ) {         
          if (o.material.userData.gltfExtensions.S8S_v3d_material_data.hasOwnProperty('nodeGraph')){
            if (o.material.userData.gltfExtensions.S8S_v3d_material_data.nodeGraph.hasOwnProperty('nodes') &&  o.material.userData.gltfExtensions.S8S_v3d_material_data.nodeGraph.nodes.length > 2){                    
              let textName =  o.material.userData.gltfExtensions.S8S_v3d_material_data.nodeGraph.nodes[2].name;                          
              if(textName !== 'Material #2'){               
                  let text = textureLoader.load(`${this.modelData.data[0].path}/${textName}.png`);
                  o.material =  new THREE.MeshStandardMaterial({map: text});
                  roughnessMipmapper.generateMipmaps(o.material);              
                  o.material.smoothShading = true;
                  o.material.envMap = this.envMap;      
              }
            } 
          }           
        }                                                     
    })
    return model;
}

  /**
   * @function :Animations handling
   * @param :operation 
   * @param :animations 
   * @param :from 
   * @param :to 
   * @param :loop 
   * @param :speed 
   * @param :callback 
   * @param :isPlayAnimCompat 
   * @param :rev 
   * @returns 
   */

animationControl = (operation:string, animations:any, from:number, to:number, loop:string, speed:any, callback:any, isPlayAnimCompat:boolean, rev:boolean, view:any) => {
  if (!animations)
  return;
    if (typeof animations == "string")
      animations = [animations];
      this.mixer = new THREE.AnimationMixer(this.model.scene);
     
      let animationProcess = (animationName:any) => {      
        this.animationPlay = this.mixer.clipAction(animationName)
        if (! this.animationPlay)
          return;  
          switch (operation) {
            case 'PLAY':
                if (! this.animationPlay.isRunning()) {
                      this.animationPlay.reset();

                      let scene = this.getSceneByAction( this.animationPlay );
                      let frameRate =  this.getSceneAnimFrameRate(scene);
                    
                    // compatibility reasons: deprecated playAnimation puzzles don't
                    // change repetitions
                    if (!isPlayAnimCompat) {
                     // this.animationPlay.repetitions = Infinity;
                    }
    
                    let timeScale = Math.abs(parseFloat('0.05'));

                    if (rev){
                      timeScale = -0.05;                    
                    }
                    let startTime  = from/frameRate 
                    
                    this.animationPlay.timeScale = timeScale
                    if (to !== null) {
                      this.animationPlay.getClip().duration = to/frameRate; 
                    } else {
                      this.animationPlay.getClip().resetDuration();
                    }
                   
                    this.animationPlay.time =  timeScale >= 0 ? startTime : this.animationPlay.getClip().duration;     
                                       
                    this.animationPlay.setLoop( THREE.LoopOnce ) 
                    this.animationPlay.clampWhenFinished = true; 
                    let val = this.animationPlay.getClip().validate()
                    if(val){               
                         rev ? this.animationPlay.setEffectiveTimeScale(timeScale).play():this.animationPlay.setEffectiveTimeScale(0.05).play() 
                        let obj = this.pauseAnimGrp.find(o => o.to === to);   
                        if(typeof obj == 'undefined' )                   
                        this.pauseAnimGrp.push({'from':from,'to':to})
                      
                    }else {
                      console.log("Not valid clip")
                    }

                }
                break;
            case 'STOP':
              //  this.animationPlay = action
                this.animationPlay.stop();
                
                // remove callbacks
                let callbacks = this.animMixerCallbacks;
                for (let j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == this.animationPlay) {
                        callbacks.splice(j, 1);
                        j--
                    }     
                break;
            case 'PAUSE':           
              this.animationPlay.paused = true;
                break;
            case 'RESUME':               
              this.animationPlay.paused = false;              
                break;
            case 'SET_FRAME':
                let scene = this.getSceneByAction( this.animationPlay);
                let frameRate = this.getSceneAnimFrameRate(scene);
                this.animationPlay.time = from ? from/frameRate : 0;
                this.animationPlay.play();
                this.animationPlay.paused = true;
                break;
            }
           }
            for (let i = 0; i < this.model.animations.length; i++) {        
              let animName = this.model.animations[i];
                if (animName)
                animationProcess(animName);
            }

          //  this.initAnimationMixer();
          this.camera = view ? this.model.cameras.find(o => o.name === view) : this.model.cameras[this.cam];
    
          this.animate()
      }

/**
 * @function :Animation mixer for animations
 * @scope :to be used later
 */
initAnimationMixer = function() {
  function onMixerFinished(e) {
      let cb = this.animMixerCallbacks;
      let found = [];
      for (let i = 0; i < cb.length; i++) {
          if (cb[i][0] == e.action) {
              cb[i][0] = null; // deactivate
              found.push(cb[i][1]);
          }
      }
      for (let i = 0; i < found.length; i++) {
          found[i]();
      }
  }
  return function initAnimationMixer() {
    if (this.model.scene.mixer && !this.model.scene.mixer.hasEventListener('finished', onMixerFinished))
        this.model.scene.mixer.addEventListener('finished', onMixerFinished);
    };
}();

/**
 * @function :Get animation action scene
 * @param :action 
 * @returns 
 */
getSceneByAction = (action:any) => {
    let root = action.getRoot();
    let scene = root.type == "Scene" ? root : null;
    root.traverseAncestors(function(ancObj) {
        if (ancObj.type == "Scene") {
            scene = ancObj;
        }
    });
    return scene;
}

/**
 * @function :Get animation clip framerate
 * @param :scene 
 * @returns 
 */
getSceneAnimFrameRate = (scene:any) => {
  if (scene in scene.userData && "animFrameRate" in scene.userData) {
    return scene.userData.animFrameRate;
  }
  return 30;
}

/**
 * @function :render animation components
 */
animate = () => {
  if(this.animationPlay){
    if (this.animationPlay.isRunning()){
      requestAnimationFrame(this.animate); 
    }  

    if(this.mixer){
     this.mixer.update(Math.min(0.05, this.clock.getDelta())) 
    }  
    
  } 
  this.render()
  }

/**
 * @function : gltf model control event
 */ 
changeEvent = () => { 
 this.controls.enableZoom = true;
 this.composer.render();
}

/**
 * @function : Outline composer
 * to show highlight
 */
composerRender = () => {
  this.composer.addPass(this.renderPass);
  this.composer.addPass(this.outlinePass); 
  this.composer.render();
}

/**
 * @function :Three.js webGl render function
 */
render = () => { 
  this.hideTooltip();
  this.controls.update()
  this.renderer.render(this.scene, this.camera);    
}  

/**
 * @function :Render initial load only (onload)
 */
renderLoad = () => {
  let newInst = this;
  let callback = function() {
    // newInst.renderer.setClearColor(0xffffff, 0); 
    newInst.renderer.physicallyCorrectLights = true;  
    newInst.renderer.render(newInst.scene, newInst.camera);
    let modelapp: HTMLDivElement = document.querySelector(".imanual-app") as HTMLDivElement
    let progressBar = document.getElementById('progressBar') as HTMLDivElement;
    progressBar.style.visibility = "hidden"
    modelapp.style.visibility =  "visible"      
  }
    setTimeout(callback, 1000);          
}
}




