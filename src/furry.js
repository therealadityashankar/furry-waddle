var fw = require("./main.js");
var nameParser = require("./nameParser.js");
var pages = require("html-pages");
var extractFurryData = require("./extractData").extractFurryData;

/**
 * ok so, this stuff uses json submission
 * it DOES NOT follow https://www.w3.org/TR/html-json-forms/ ok,
 *
 * stuff has to be set likey name='pet[yo_mama]' or name='pet["yo_mama"]',
 * or just do name="per.you_mama", cuz, why not ?
 * unquoted numbers MEAN ARRAYS,
 * setting name='pet[0]' and name='pet["abcd"]' for 2 different inputs
 * isn't allowed,
 * you want 0 as text put it as name='pet["0"]'
 *
 * also this does NOT support the empty array thing, i.e. [] is not supported
 * a number there IS REQUIRED, so yeah, thats a TODO
 * TODO: yo wanna put a ", escape that too, so it becomes \" instead of ",
 * and \ becomes \\ insead of \;
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
    }

    get action(){
        return this.getAttribute('action');
    }

    set action(val){
        this.setAttribute('action', val);
    }

    handleInputs(input){
      if(input.type == "submit"){
          input.addEventListener('click', () => this.submit());
      }
    }

    reportValidity(){
        var inputs = this.currentPage.getElementsByTagName("input");
        var valid = true;
        for(var input of inputs){
            var inp_valid = input.reportValidity();
            if(valid && !inp_valid) valid = false;
        }
        return valid;
    }

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
        var body = this.extractData();
        var prom = fetch(this.action, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
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
