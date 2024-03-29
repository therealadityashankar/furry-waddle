/**
* furry erry
* the <fw-erry> tag is here
* basically it represents the error while
* submitting the data
* I swear the more I do this project the more amazing I
* feel, because this seems to, to a certian degree make
* js-less ness super easy!
*/
var fw = require("./main.js");
fw.FurryErry = class extends HTMLElement{
    constructor(){
      super();
      this.setFurryEl();

      /* this will be set to the parent furry-erry if it is in a furry-erry*/
      this.defaultFurry = undefined;
    }

    /**
    * get the furry element needed
    */
    get furryEl(){
      return this.getAttribute('furry-el');
    }

    /**
    * set the furry element
    */
    set furryEl(newEl){
      this.setAttribute('furry-el', newEl);
    }

    /**
    *
    */
    get connectedFurry(){
      var furry = document.querySelector(this.furryEl);
      if(!furry && this.defaultFurry) return this.defaultFurry;
      return furry;
    }

    /**
    * read the customElements docs to know what this is for
    */
    static get observedAttributes(){
        return ['furry-el'];
    }

    /**
    * this function is called every time the 'furry-el' getAttribute
    * is changed
    */
    setFurryEl(){
      var furryEl = this.connectedFurry;
      if(furryEl){
        if(!(furryEl.onFailedSubmission && furryEl.onSuccessfulSubmission)){
          throw new fw.BadConnectedElementError("the connected element to <furry-erry furry-el=...> (in the furry-el='name') must have .onFailedSubmission() & .onSuccessfulSubmission() functions in it");
        }


        // either bind it or its a arrow function
        furryEl.onSuccessfulResponse(resp => this.successfulResponseCB(resp));
        furryEl.onFailedSubmission(err => this.failedSubmissionCB(err));
        furryEl.onBadResponse(err => this.BadResponseCB(err));
      }
    }

    /**
    * on successful responses
    * @param {String} successMessage - the text to show on a successful form submission, defaults to "success"
    */
    successfulResponseCB(resp){
        this.declareSuccess();
    }

    /**
    * on bad responses
    */
    BadResponseCB(resp){
      resp.text().then(text => this.declareError(text));
    }

    /**
    * on failed submissions (like an internet error or something)
    */
    failedSubmissionCB(err){
      this.declareError(err);
    }

    /**
    * on failure this function must be executed
    * (it is auto-executed if the parent element is a fw-furry)
    * show the error
    *
    * @param {string} text - the text to display in failure
    */
    declareError(text){
      this.innerText = text;
      this.classList.add("error");
      this.classList.remove("success");
    }

    /**
    * on success this function is executed
    *
    * @param {string} [text] - the text to display on success, defaults to "success"
    */
    declareSuccess(text){
      this.innerText = text||"success";
      this.classList.add("success");
      this.classList.remove("error");
    }

    /**
    * read the customElements docs for what this is
    */
    attributeChangedCallback(name, oldVal, newVal){
        if(name == 'furry-el') this.setFurryEl();
    }
};

customElements.define("fw-erry", fw.FurryErry);
