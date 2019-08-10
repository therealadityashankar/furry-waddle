var fw = require("./main.js");
var nameParser = require("./nameParser.js");
var pages = require("html-pages");
var extractFurryData = require("./extractData").extractFurryData;

/**
 ok so, this stuff uses json submission
 it DOES NOT follow https://www.w3.org/TR/html-json-forms/ ok,

 json names -
   stuff has to be set likey name='pet[yo_mama]' or name='pet["yo_mama"]',
   or just do name="per.you_mama", cuz, why not ?
   unquoted numbers MEAN ARRAYS,
   setting name='pet[0]' and name='pet["abcd"]' for 2 different inputs
   isn't allowed,
   you want 0 as text put it as name='pet["0"]'

   also this does NOT support the empty array thing, i.e. [] is not supported
   a number there IS REQUIRED, so yeah, thats a TODO
   TODO: yo wanna put a ", escape that too, so it becomes \" instead of ",
   and \ becomes \\ insead of \;

 connected page containers -
   the Furry automatically sets its page container as the earliest found
   page container from its parents, i.e, it checks its parent, its parent's parent
   and so on, until it finds a page container and auto sets that page container
   as its pageContainer
   this is accessable by furryDOMElement.pageContainer

 if you want to set another page container as its page container you could
 do that through the page-el attribute in a <furry-waddle>
 so for example

      <page-container id="pc">
      </page-container>
      <fw-furry page-el="#pc"></fw-furry>

 connected page container options

 you can do 2 things to connected page containers via attributes,

 - automatically set it to the next page of the page container
 after a SUCCESSFUL RESPONSE OF 200 from the fw-furry
      <fw-furry auto-next-on-submit></fw-furry>

 - same thing as above except set it to a specific page after submitting
      <fw-furry on-submit-page="pageName"></fw-furry>
      which automatically sets the pageContainer to a specific page after submission

  events -
     the fw-furry element fires the "submit" event on submission
 */
fw.Furry = class extends pages.PageContainer{
    constructor(){
        super();
        var checkForSubmitBtn = (records, observer) => {
            for(var record of records){
              for(var node of record.addedNodes){
                if(node instanceof HTMLInputElement){
                    this.handleInputs(node);
                }
                if(node instanceof fw.FurryErry){
                    node.defaultFurry = this;
                    node.setFurryEl();
                }
              }}
        };

        this.observer = new MutationObserver(checkForSubmitBtn);
        this.observer.observe(this, {
            childList: true,
            subtree: true
        });
        this.afterSuccessfulSubmissionFunctions = [];
        this.afterFailedSubmissionFunctions = [];
        this.afterSuccessfulResponseFunctions = [];
        this.afterBadResponseFunctions = [];
        this.setDefaultPageContainer();
        this.onSuccessfulResponse(() => this.autoSetPageContainerPage());
    }

    /**
    * read the customElements docs to know what this is for
    */
    static get observedAttributes(){
        return ['page-el', 'auto-next-on-submit', 'on-submit-page'];
    }

    /**
    * sets the default page container
    */
    setDefaultPageContainer(){
      var pageEl = this.getAttribute("page-el");
      if(!pageEl){
          var defaultPCLoadingFunction = () => {
            /**
            * this is used when no pageEl is specified via tags
            */
            var defaultCP = this.parentElement;

            while(true){
              /**
              * we try getting the default connected page container by repeatedly
              * checking the parents and the parents parents and so on
              * until we hit a page container or the body or Null
              */
              var isBody = (defaultCP == document.body);
              var isPageContainer = (defaultCP instanceof pages.PageContainer);
              var isUnknown = !defaultCP;

              if(isBody||isUnknown){
                break;
              } else if (isPageContainer) {
                this.pageContainer = defaultCP;
                break;
              }

              defaultCP = defaultCP.parentElement;
            }
          };

          document.addEventListener('DOMContentLoaded', defaultPCLoadingFunction);
      }
    }

    /**
    * read the customElements docs for what this is
    */
    attributeChangedCallback(name, oldVal, newVal){
        if(name == 'page-el') this.setPageContainerFromQS(newVal);
    }

    /**
    * get an input from its name
    *
    * @param {string} name - the name of the element
    *
    * @returns an element corrosponding to the name, or undefined;
    */
    getElFromName(name){
      for(var inp of this.getElementsByTagName("input")){
        if(inp.name == name) return inp;
      }
    }

    get autoNextOnSubmit(){
        var val = this.getAttribute('auto-next-on-submit');
        if(['true', '', 'True'].includes(val)){
          if(val != 'true'){
            this.setAttribute('auto-next-on-submit', 'true');
          }

          return true;
        }
        return false;
    }

    set autoNextOnSubmit(val){
        if(val) this.setAttribute('auto-next-on-submit', 'true');
        else this.removeAttribute('auto-next-on-submit');
    }

    get onSubmitPageName(){
        return this.getAttribute('on-submit-page');
    }

    get pageContainer(){
        return this._pageContainer;
    }

    /**
    * if the pageContainer is dynamically set -
    */
    set pageContainer(val){
        this.removeAttribute('page-el');
        this._pageContainer = val;
    }

    /**
    * set the page container from a querySelector
    * @param {string} pageEl - the querySelector string
    */
    setPageContainerFromQS(pageEl){
      var pageContainer = document.querySelector(pageEl);
      if(!pageContainer){
          throw new fw.BadConnectedElementError('connected element is unknown!');
      }

      this._pageContainer = pageContainer;
    }

    /**
    * auto set the page container after a successful request
    * if a page container is present
    * depending on the tags ''
    */
    autoSetPageContainerPage(){
      if(this.pageContainer){
        if(this.autoNextOnSubmit){
          this.pageContainer.nextPage();
        }
        else if(this.onSubmitPageName){
          this.pageContainer.setPage(this.onSubmitPageName);
        }
      }
    }

    get action(){
        return this.getAttribute('action');
    }

    set action(val){
        this.setAttribute('action', val);
    }

    /**
    * takes care of the "submit" imput
    */
    handleInputs(input){
      if(input.type == "submit"){
          input.addEventListener('click', () => this.submit());
      }
    }

    /**
    * reports if the data in the fw-furry is
    * valid, returns true or false depending
    * on if its valid or not
    */
    reportValidity(){
        var inputs = this.currentPage.getElementsByTagName("input");
        var valid = true;
        for(var input of inputs){
            var inp_valid = input.reportValidity();
            if(valid && !inp_valid) valid = false;
        }
        return valid;
    }

    /**
    * checks if the data in the fw-furry is
    * valid, returns true or false depending
    * on if its valid or not
    */
    checkValidity(){
        var inputs = this.getElementsByTagName("input");
        var valid = true;
        for(var input of inputs){
            var inp_valid = input.checkValidity();
            if(valid && !inp_valid) valid = false;
        }
        return valid;
    }

    /**
     * extract the data as a json object
     */
    extractData(){
        return extractFurryData(this);
    }

    /**
     * submit the data
     */
    submit(){
        this.dispatchEvent(new CustomEvent("submit"));
        if(this.action){
          var body = this.extractData();
          var prom = fetch(this.action, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {'Content-Type': 'application/json'}
          });
          prom.then(resp => {
              for (let f of this.afterSuccessfulSubmissionFunctions) f(resp);
              if(resp.status == 200){
                for(let f of this.afterSuccessfulResponseFunctions) f(resp);
              } else{
                for(let f of this.afterBadResponseFunctions) f(resp);
              }
          });

          prom.catch(error => {
              for(var f of this.afterFailedSubmissionFunctions) f(error);
          });
        }
    }

    /**
     * after successfully submitting the data
     * do this
     *
     * successfull submission DOES NOT MEAN a reponse of 200
     * just that the data was sent, for that see the
     * .onSuccessfulResponse(...) function
     *
     * function takes a callback
     * callback gets the response as the parameter
     */
    onSuccessfulSubmission(f){
        this.afterSuccessfulSubmissionFunctions.push(f);
    }

    /**
     * if the submission fails do this
     *
     * function takes a callback
     * callback gets the error as a parameter
     */
    onFailedSubmission(f){
        this.afterFailedSubmissionFunctions.push(f);
    }

    /**
     * called when the submission has a response
     * of code 200
     * the response will be passed onto the function as a parameter
     */
    onSuccessfulResponse(f){
        this.afterSuccessfulResponseFunctions.push(f);
    }

    /**
     * called when the submission has a response of
     * a code that is not 200
     * the response will be passed onto the function as a parameter
     *
     * also check out the .onFailedSubmission(...) function from this
     * class for when actually submitting the data fails
     */
     onBadResponse(f){
         this.afterBadResponseFunctions.push(f);
     }

    /**
     * reads the input name and returns its components
     * in an array, numbers mean numbers and strings are
     * strings, I learnt how to do this by reading llvm docs
     */
    static readInputName(name){
        return nameParser(name);
    }

    nextPage(){
        if(this.reportValidity()) super.nextPage();
    }

    skipPage(){
        super.nextPage();
    }
};
customElements.define("fw-furry", fw.Furry);
