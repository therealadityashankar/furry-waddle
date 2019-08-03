/**
so this is code for the <fw-countii-up> and <fw-countii-down> tools
for number inputs, basically for setting them to go up or down.

basic usage:
  <fw-countii-up el-name=""></fw-countii-up>
  <fw-countii-down el-name=""></fw-countii-down>
*/
var fw = require("./main.js");

fw.countii = class extends HTMLElement{
  constructor(){
    super();
    this.addEventListener('click',() => this.setElementValue());
    this._furry = undefined;
    this._element = undefined;

    var furryEl = this.getAttribute('furry-el');
    if(!furryEl){
        var defaultFurryLoadingFunction = () => {
          /**
          * this is used when no pageEl is specified via tags
          */
          var defaultFurry = this.parentElement;

          while(true){
            /**
            * we try getting the default connected Furry by repeatedly
            * checking the parents and the parents parents and so on
            * until we hit a Furry or the body or Null
            */
            var isBody = (defaultFurry == document.body);
            var isPageContainer = (defaultFurry instanceof fw.Furry);
            var isUnknown = !defaultFurry;

            if(isBody||isUnknown){
              break;
            } else if (isPageContainer) {
              this._furry = defaultFurry;
              break;
            }

            defaultFurry = defaultFurry.parentElement;
          }
        };

        document.addEventListener('DOMContentLoaded', defaultFurryLoadingFunction);
    }
  }
  /**
  * read the customElements docs to know what this is for
  */
  static get observedAttributes(){
      return ['furry-el', 'el-name', 'input-el']
  }

  get elName(){
    return this.getAttribute('el-name');
  }

  /**
  * read the customElements docs for what this is
  */
  attributeChangedCallback(name, oldVal, newVal){
      if(name == 'furry-el') this._furry = document.querySelector(newVal);
      else if(name == 'input-el') this._element = document.querySelector(newVal);
      else if(name == 'el-name'){
        this._element = undefined;
      }
  }

  /**get the connected furry*/
  get furry(){
    return this._furry;
  }

  /**set the connected furry dynamically*/
  set furry(val){
    this.removeAttribute("furry-el");
    this._furry = val;
  }

  /**get the connected element*/
  get element(){
    if(this._element) return this._element;
    else if(this.elName) return this.furry.getElFromName(this.elName);
  }

  /**set the connected element dynamically*/
  set element(val){
    this.removeAttribute("el-name");
    this.removeAttribute('input-el');
    this._element = val;
  }
}


/**
  counter for movin values up
*/
fw.countiiUp = class extends fw.countii{
  setElementValue(){
    this.element.stepUp();
  }
}

/**
  counter for movin values down
*/
fw.countiiDown = class extends fw.countii{
  setElementValue(){
    this.element.stepDown();
  }
}

customElements.define("fw-countii-up", fw.countiiUp);
customElements.define("fw-countii-down", fw.countiiDown);
