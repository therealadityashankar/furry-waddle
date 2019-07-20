(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var pages = require("./main")
pages.PagesError = class extends Error{};
pages.UnknownPageError = class extends pages.PagesError{};
pages.PageOutOfBounds = class extends pages.PagesError{};
pages.BadParentError = class extends pages.PagesError{};

},{"./main":2}],2:[function(require,module,exports){
var pages = {}

module.exports = pages

},{}],3:[function(require,module,exports){
var pages = require("./main.js");
/**
 * add all functions to a class that a page should have
 * done in a meta way, because FormPageElement must've all the functions
 * however I don't wanna extend (or can't, too lazy to see if i can) 
 * both HTMLFormElement as well as NormalPageElement
 *
 * @classObj a class/a function
 *
 * do pages._addPageElementFunctions(classObj) to add all class functions required in a page
 *
 * also this.pageConstructor() must be called initially!
 */
pages.NormalPageElement =
class extends HTMLElement{
    /**
     * create a normal page!
     */
    constructor(){
        super();
        this.currentParent = undefined;
    }

    /**attributes to observe, any additional attributes MUST be mentioned
     for the browser to recognise there has been a change*/
    get observedAttributes(){ return ['current'] }

    /**
     * returns the name of the page
     */
    get name(){return this.getAttribute('pname');}

    /** alias for name*/
    get pname(){return this.name}

    /**
     * checks if the page is set as current
     */
    get isCurrentPage(){
            var curr = this.getAttribute('current');
            if(curr === ''||
               curr === 'current'||
               curr === 'True'||
               curr === 'true'){

                // this if condition needs to be there
                // else it will observe recurrance
                if(curr != 'current'){
                    this.setAttribute('current', 'current');
                }
                return true;
            } else{
                this.removeAttribute('current');
                return false
            }
    }
    
    /**
     * when the element is connected to something
     */
    connectedCallback(){
        if(this.isConnected){
            this.setParentContainer();
        }
    }

    /**
     * when the element is connected
     */
    disconnectedCallback(){
        this.currentParent.refresh();
        this.currentParent = undefined;
    }

    /**
     * sets the parent container to recognize the element properly
     */
    setParentContainer(){
        if(this.parentNode instanceof pages.PageContainer){
            this.parentNode.addPage(this);
        }
        this.currentParent = this.parentNode;
    }

    /**
     * when any attibute changes
     */
    attributeChangedCallback(name, 
                             oldVal, 
                             newVal){
        /**
         * if the 'current' attribute was changed
         */
        if(this.isCurrentPage){
            if(this.parentNode instanceof pages.PageContainer){
                this.parentNode.setPage(this);
            }
        }
    }
}

customElements.define('n-page', pages.NormalPageElement);

},{"./main.js":2}],4:[function(require,module,exports){
var pages = require("./main.js")

/**
 * defines the <page-container> element
 *
 * if <page-container rolling>,
 * i.e. it has the rolling attribute as '', 'true', 'True'
 * or 'rolling' (a unspecified tag means ''),
 * for a PageContainer element pc
 * then pc.nextPage() will set it to the first page
 * if it is in the last page, and pc.previousPage() will set it
 * to the last page if it is in the first page
 */
class PageContainer extends HTMLElement{
    constructor(){
        super();
        this.onPageChangeFunctions = [];
    }

    /**
     * check if rolling is true
     */
    get rolling(){
        var rolling = this.getAttribute('rolling');
        if (['rolling', '', 'true', 'True'].includes(rolling)){
            this.setAttribute('rolling', 'rolling');
            return true
        } else{
            this.removeAttribute('rolling');
            return false
        }
    }

    /**
     * set rolling
     * @param value - value must be 'true', true, 'True' or 'rolling' for the rolling attribute to be true
     */
    set rolling(value){
        var rolling = ['true', 'True', true, 'rolling'].includes(value)
        if(rolling) this.setAttribute('rolling', 'rolling');
        else this.removeAttribute('rolling');
    }

    /**
     * get all the pages
     */
    get pages(){
        return this.children
    }

    /**
     * get the names of all pages
     */ 
    get pageNames(){
        var names = []
        for(var page of this.pages){
            names.push(page.name);
        }
        return names
    }

    /**
     * check if its on the first page
     */
    get onFirstPage(){
        return this.pages[0].isCurrentPage
    }

    /**
     * check if its on the last page
     */
    get onLastPage(){
        var lastPageIndex = this.pages.length - 1
        return this.pages[lastPageIndex].isCurrentPage
    }

    /**
     * get the current page
     */
    get currentPage(){
        for(var page of this.pages){
            if(page.isCurrentPage){
                return page
            }
        }
    }

    /**
     * get the current page's index
     */
    get currentPageIndex(){
        for(var i = 0; i<this.pages.length; i++){
            var page = this.pages[i];
            if(page.isCurrentPage){
                return i
            }
        }
    }

    /**
     * set the next page
     *
     * see the class documentation for rolling page containers
     */
    nextPage(){
        if(!this.onLastPage){
            var index = this.currentPageIndex;
            var nextPage = this.pages[index + 1];
            this.setPage(nextPage);
        }else{
            var nextPage = this.pages[0];
            if(this.rolling)  this.setPage(nextPage);
            else throw new pages.PageOutOfBounds('nextPage() was called on a last page! set <page-container rolling> if you want the page container to roll to the first page!')
        }
    }

    /**
     * set the previous page
     *
     * see the class documentation for rolling page containers
     */
    previousPage(){
        if(!this.onFirstPage){
            var index = this.currentPageIndex;
            var prevPage = this.pages[index - 1];
            this.setPage(prevPage);
        }else{
            var prevPage = this.pages[this.pages.length - 1];
            if(this.rolling)  this.setPage(prevPage);
            else throw new pages.PageOutOfBounds('previousPage() was called on a first page! set <page-container rolling> if you want the page container to roll to the last page!')
        }
    }

    /**
     * get a page from its name
     *
     * @param {string} pagename - the name of the page
     */
    getPage(pagename){
        for(var page of this.pages){
            if(page.name == pagename) return page
        }
    }

    /**
     * this function is automatically called by the page,
     * so don't use it directly
     *
     * adds the page, displays it if it is marked and
     * 'show' or is the only page
     *
     * @param page - a page object (the one added)'
     */
    addPage(page){
        /* if it is the only page, display it!
           else display it if its current attribute is empty
           as in '', that means it is present, else if the attribute
           is null, that means it isn't, I need to tea
           else hide it */
        if (this.pages.length == 1) this.showPage(page);
        else if(page.isCurrentPage) this.setPage(page);
        else this.hidePage(page);
    }

    /**
     * refresh stored pages
     *
     * call this when a page is removed
     */
    refresh(){
        // the first page marked as current will be sent
        // as the current page
        for(var page of this.pages){
            if(page.isCurrentPage){
                this.setPage(page);
                return
            }
        }

        // if nothing is the current page, switch to the last one
        var lastPageNo = this.pages.length - 1;
        var lastPage = this.pages[lastPageNo]
        this.setPage(lastPage);
    }

    /**
     * show the page
     *
     * DO NOT USE this anywhere but .setPage() as that calls the
     * "pagechange" event, incorrect showing/hiding of pages will
     * not call it AND change the page, leading to issues like the
     * <next-page> or <previous-page> button being invisible and stuff
     */
    showPage(page){
        if(!(page.getAttribute('current') == 'current')){
            page.style.display = "";
            page.setAttribute('current', 'current');
        }
    }

    /**
     * hide the page
     *
     * DO NOT USE this anywhere but .setPage() and .addPage()
     * as that calls the "pagechange" event, 
     * incorrect showing/hiding of pages will
     * not call it AND change the page, leading to issues like the
     * <next-page> or <previous-page> button being invisible and stuff
     */
    hidePage(page){
        page.style.display = "none";
        page.removeAttribute('current');
    }

    /**
     * switch to this page as the current page
     *
     * @param currpage - a <n-page> or similar object, or a string referring to the name of the page
     */
    setPage(currpage){
        if(typeof currpage == 'string') currpage = this.getPage(currpage);
        for(var page of this.pages){
            if(page == currpage) this.showPage(currpage)
            else this.hidePage(page)
        }
        var pageChangedEvent = new CustomEvent('pagechange');
        this.dispatchEvent(pageChangedEvent);
    }
}

customElements.define('page-container', PageContainer);
pages.PageContainer = PageContainer

},{"./main.js":2}],5:[function(require,module,exports){
/**
 * nav buttons for navigating between elements that have
 * a .nextPage() and/or .previousPage() attribute
 *
 * <next-page> for next page
 * <prev-page> for the previous page
 *
 * nav buttons must've a page
 * "page-el" attribute, i.e something like 
 * <next-page page-el="#abc"></next-page>, which is an attribute specifying
 * the page they're connected to in querySelection terms
 *
 * if the "auto-hide" attribute is specified,
 * i.e <next-page ... auto-hide>, then the nav-button
 * automatically hides itself when there is no next page,
 * i.e., if "el" is the container tag
 * el.onFirstPage() being true hides the <prev-page> tag
 * el.onLastPage() being true hides the <next-page> tag
 * using <... style="display: none"></...>
 */
var pages = require("./main");

/**
 * base class for the navigation buttons
 *
 * navigation buttons must impliment
 * a .btnAction() function, and
 * a .hiding getter()
 *
 * the button is hidden as per the hiding getter and,
 * its action corrosponds to the .btnAction fn
 */
pages.NavBtns =
class extends HTMLElement{
    constructor(){
        super();
        this.type = 'button';
        this.setConnectedElement();
        this.addEventListener('click', function(){
            if(!this.pageEl) throw pages.UnknownPageError('no "page-el" specified in navigation tag')
            else this.btnAction();
        });
    }

    static get observedAttributes(){
        return ['page-el', 'auto-hide']
    }

    get pageEl(){
        return this.getAttribute('page-el');
    }

    get autoHide(){
        var hideAttr = this.getAttribute('auto-hide');
        if([true, 'True', 'true', 'auto-hide', ''].includes(hideAttr)){
            if(hideAttr != 'true') this.setAttribute('auto-hide', 'true');
            return true
        }
        return false
    }

    set autoHide(value){
        if(value) this.setAttribute('auto-hide', 'true');
        else this.setAttribute('auto-hide', 'false')
    }

    setConnectedElement(){
        this.connectedEl = document.querySelector(this.pageEl);
        if(!this.connectedEl){
            return
        }
        if(!(this.connectedEl.nextPage||this.connectedEl.previousPage)){
            throw new pages.BadParentError(`<next-page> and <prev-page> elements can only have "page-el" attributes referring to tags that support .nextPage() or .previousPage() (like <page-container> tags), ${this.pageEl} does not support that!`);
        }
        this.connectedEl
          .addEventListener('pagechange', 
                            this.autoHideIfNeeded.bind(this))
        this.autoHideIfNeeded();
    }

    autoHideIfNeeded(){
        if(this.autoHide && this.hidden){
            this.style.display = "none";
        } else{
            this.style.display = "";
        }
    }

    attributeChangedCallback(name, oldVal, newVal){
        if(name == 'page-el') this.setConnectedElement();
        else if(name == 'auto-hide') this.autoHideIfNeeded();
    }
}

/**goto the next page*/
pages.NextPage =
class extends pages.NavBtns{
    btnAction(){this.connectedEl.nextPage();}
    get hidden(){return this.connectedEl.onLastPage}
}

/**goto the previous page*/
pages.PreviousPage =
class extends pages.NavBtns{
    btnAction(){this.connectedEl.previousPage();}
    get hidden(){return this.connectedEl.onFirstPage}
}

customElements.define('next-page', pages.NextPage);
customElements.define('prev-page', pages.PreviousPage);

},{"./main":2}],6:[function(require,module,exports){
/**
 * the page class element interface
 * the <n-page> tag, <page-container> tag
 * are defined here
 *
 * page-containers have a default size of 100x100, you probably want to change that
 */
if(typeof(window) !== "undefined") {
    window.MutationObserver = require('mutation-observer');
}

var pages = require("./main");
require('./errors');
require("./page");
require('./page-container');
require("./n-page");
require('./page-navigate.js');

if(typeof(window) !== "undefined") {
    window.pages = pages;
}
module.exports = pages;

},{"./errors":1,"./main":2,"./n-page":3,"./page":6,"./page-container":4,"./page-navigate.js":5,"mutation-observer":7}],7:[function(require,module,exports){
var MutationObserver = window.MutationObserver
  || window.WebKitMutationObserver
  || window.MozMutationObserver;

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var WeakMap = window.WeakMap;

if (typeof WeakMap === 'undefined') {
  var defineProperty = Object.defineProperty;
  var counter = Date.now() % 1e9;

  WeakMap = function() {
    this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
  };

  WeakMap.prototype = {
    set: function(key, value) {
      var entry = key[this.name];
      if (entry && entry[0] === key)
        entry[1] = value;
      else
        defineProperty(key, this.name, {value: [key, value], writable: true});
      return this;
    },
    get: function(key) {
      var entry;
      return (entry = key[this.name]) && entry[0] === key ?
          entry[1] : undefined;
    },
    'delete': function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      var hasValue = entry[0] === key;
      entry[0] = entry[1] = undefined;
      return hasValue;
    },
    has: function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      return entry[0] === key;
    }
  };
}

var registrationsTable = new WeakMap();

// We use setImmediate or postMessage for our future callback.
var setImmediate = window.msSetImmediate;

// Use post message to emulate setImmediate.
if (!setImmediate) {
  var setImmediateQueue = [];
  var sentinel = String(Math.random());
  window.addEventListener('message', function(e) {
    if (e.data === sentinel) {
      var queue = setImmediateQueue;
      setImmediateQueue = [];
      queue.forEach(function(func) {
        func();
      });
    }
  });
  setImmediate = function(func) {
    setImmediateQueue.push(func);
    window.postMessage(sentinel, '*');
  };
}

// This is used to ensure that we never schedule 2 callas to setImmediate
var isScheduled = false;

// Keep track of observers that needs to be notified next time.
var scheduledObservers = [];

/**
 * Schedules |dispatchCallback| to be called in the future.
 * @param {MutationObserver} observer
 */
function scheduleCallback(observer) {
  scheduledObservers.push(observer);
  if (!isScheduled) {
    isScheduled = true;
    setImmediate(dispatchCallbacks);
  }
}

function wrapIfNeeded(node) {
  return window.ShadowDOMPolyfill &&
      window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
      node;
}

function dispatchCallbacks() {
  // http://dom.spec.whatwg.org/#mutation-observers

  isScheduled = false; // Used to allow a new setImmediate call above.

  var observers = scheduledObservers;
  scheduledObservers = [];
  // Sort observers based on their creation UID (incremental).
  observers.sort(function(o1, o2) {
    return o1.uid_ - o2.uid_;
  });

  var anyNonEmpty = false;
  observers.forEach(function(observer) {

    // 2.1, 2.2
    var queue = observer.takeRecords();
    // 2.3. Remove all transient registered observers whose observer is mo.
    removeTransientObserversFor(observer);

    // 2.4
    if (queue.length) {
      observer.callback_(queue, observer);
      anyNonEmpty = true;
    }
  });

  // 3.
  if (anyNonEmpty)
    dispatchCallbacks();
}

function removeTransientObserversFor(observer) {
  observer.nodes_.forEach(function(node) {
    var registrations = registrationsTable.get(node);
    if (!registrations)
      return;
    registrations.forEach(function(registration) {
      if (registration.observer === observer)
        registration.removeTransientObservers();
    });
  });
}

/**
 * This function is used for the "For each registered observer observer (with
 * observer's options as options) in target's list of registered observers,
 * run these substeps:" and the "For each ancestor ancestor of target, and for
 * each registered observer observer (with options options) in ancestor's list
 * of registered observers, run these substeps:" part of the algorithms. The
 * |options.subtree| is checked to ensure that the callback is called
 * correctly.
 *
 * @param {Node} target
 * @param {function(MutationObserverInit):MutationRecord} callback
 */
function forEachAncestorAndObserverEnqueueRecord(target, callback) {
  for (var node = target; node; node = node.parentNode) {
    var registrations = registrationsTable.get(node);

    if (registrations) {
      for (var j = 0; j < registrations.length; j++) {
        var registration = registrations[j];
        var options = registration.options;

        // Only target ignores subtree.
        if (node !== target && !options.subtree)
          continue;

        var record = callback(options);
        if (record)
          registration.enqueue(record);
      }
    }
  }
}

var uidCounter = 0;

/**
 * The class that maps to the DOM MutationObserver interface.
 * @param {Function} callback.
 * @constructor
 */
function JsMutationObserver(callback) {
  this.callback_ = callback;
  this.nodes_ = [];
  this.records_ = [];
  this.uid_ = ++uidCounter;
}

JsMutationObserver.prototype = {
  observe: function(target, options) {
    target = wrapIfNeeded(target);

    // 1.1
    if (!options.childList && !options.attributes && !options.characterData ||

        // 1.2
        options.attributeOldValue && !options.attributes ||

        // 1.3
        options.attributeFilter && options.attributeFilter.length &&
            !options.attributes ||

        // 1.4
        options.characterDataOldValue && !options.characterData) {

      throw new SyntaxError();
    }

    var registrations = registrationsTable.get(target);
    if (!registrations)
      registrationsTable.set(target, registrations = []);

    // 2
    // If target's list of registered observers already includes a registered
    // observer associated with the context object, replace that registered
    // observer's options with options.
    var registration;
    for (var i = 0; i < registrations.length; i++) {
      if (registrations[i].observer === this) {
        registration = registrations[i];
        registration.removeListeners();
        registration.options = options;
        break;
      }
    }

    // 3.
    // Otherwise, add a new registered observer to target's list of registered
    // observers with the context object as the observer and options as the
    // options, and add target to context object's list of nodes on which it
    // is registered.
    if (!registration) {
      registration = new Registration(this, target, options);
      registrations.push(registration);
      this.nodes_.push(target);
    }

    registration.addListeners();
  },

  disconnect: function() {
    this.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        var registration = registrations[i];
        if (registration.observer === this) {
          registration.removeListeners();
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
    this.records_ = [];
  },

  takeRecords: function() {
    var copyOfRecords = this.records_;
    this.records_ = [];
    return copyOfRecords;
  }
};

/**
 * @param {string} type
 * @param {Node} target
 * @constructor
 */
function MutationRecord(type, target) {
  this.type = type;
  this.target = target;
  this.addedNodes = [];
  this.removedNodes = [];
  this.previousSibling = null;
  this.nextSibling = null;
  this.attributeName = null;
  this.attributeNamespace = null;
  this.oldValue = null;
}

function copyMutationRecord(original) {
  var record = new MutationRecord(original.type, original.target);
  record.addedNodes = original.addedNodes.slice();
  record.removedNodes = original.removedNodes.slice();
  record.previousSibling = original.previousSibling;
  record.nextSibling = original.nextSibling;
  record.attributeName = original.attributeName;
  record.attributeNamespace = original.attributeNamespace;
  record.oldValue = original.oldValue;
  return record;
};

// We keep track of the two (possibly one) records used in a single mutation.
var currentRecord, recordWithOldValue;

/**
 * Creates a record without |oldValue| and caches it as |currentRecord| for
 * later use.
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecord(type, target) {
  return currentRecord = new MutationRecord(type, target);
}

/**
 * Gets or creates a record with |oldValue| based in the |currentRecord|
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecordWithOldValue(oldValue) {
  if (recordWithOldValue)
    return recordWithOldValue;
  recordWithOldValue = copyMutationRecord(currentRecord);
  recordWithOldValue.oldValue = oldValue;
  return recordWithOldValue;
}

function clearRecords() {
  currentRecord = recordWithOldValue = undefined;
}

/**
 * @param {MutationRecord} record
 * @return {boolean} Whether the record represents a record from the current
 * mutation event.
 */
function recordRepresentsCurrentMutation(record) {
  return record === recordWithOldValue || record === currentRecord;
}

/**
 * Selects which record, if any, to replace the last record in the queue.
 * This returns |null| if no record should be replaced.
 *
 * @param {MutationRecord} lastRecord
 * @param {MutationRecord} newRecord
 * @param {MutationRecord}
 */
function selectRecord(lastRecord, newRecord) {
  if (lastRecord === newRecord)
    return lastRecord;

  // Check if the the record we are adding represents the same record. If
  // so, we keep the one with the oldValue in it.
  if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
    return recordWithOldValue;

  return null;
}

/**
 * Class used to represent a registered observer.
 * @param {MutationObserver} observer
 * @param {Node} target
 * @param {MutationObserverInit} options
 * @constructor
 */
function Registration(observer, target, options) {
  this.observer = observer;
  this.target = target;
  this.options = options;
  this.transientObservedNodes = [];
}

Registration.prototype = {
  enqueue: function(record) {
    var records = this.observer.records_;
    var length = records.length;

    // There are cases where we replace the last record with the new record.
    // For example if the record represents the same mutation we need to use
    // the one with the oldValue. If we get same record (this can happen as we
    // walk up the tree) we ignore the new record.
    if (records.length > 0) {
      var lastRecord = records[length - 1];
      var recordToReplaceLast = selectRecord(lastRecord, record);
      if (recordToReplaceLast) {
        records[length - 1] = recordToReplaceLast;
        return;
      }
    } else {
      scheduleCallback(this.observer);
    }

    records[length] = record;
  },

  addListeners: function() {
    this.addListeners_(this.target);
  },

  addListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.addEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.addEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.addEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.addEventListener('DOMNodeRemoved', this, true);
  },

  removeListeners: function() {
    this.removeListeners_(this.target);
  },

  removeListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.removeEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.removeEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.removeEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.removeEventListener('DOMNodeRemoved', this, true);
  },

  /**
   * Adds a transient observer on node. The transient observer gets removed
   * next time we deliver the change records.
   * @param {Node} node
   */
  addTransientObserver: function(node) {
    // Don't add transient observers on the target itself. We already have all
    // the required listeners set up on the target.
    if (node === this.target)
      return;

    this.addListeners_(node);
    this.transientObservedNodes.push(node);
    var registrations = registrationsTable.get(node);
    if (!registrations)
      registrationsTable.set(node, registrations = []);

    // We know that registrations does not contain this because we already
    // checked if node === this.target.
    registrations.push(this);
  },

  removeTransientObservers: function() {
    var transientObservedNodes = this.transientObservedNodes;
    this.transientObservedNodes = [];

    transientObservedNodes.forEach(function(node) {
      // Transient observers are never added to the target.
      this.removeListeners_(node);

      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i] === this) {
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
  },

  handleEvent: function(e) {
    // Stop propagation since we are managing the propagation manually.
    // This means that other mutation events on the page will not work
    // correctly but that is by design.
    e.stopImmediatePropagation();

    switch (e.type) {
      case 'DOMAttrModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-attributes

        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;

        // 1.
        var record = new getRecord('attributes', target);
        record.attributeName = name;
        record.attributeNamespace = namespace;

        // 2.
        var oldValue = null;
        if (!(typeof MutationEvent !== 'undefined' && e.attrChange === MutationEvent.ADDITION))
          oldValue = e.prevValue;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.attributes)
            return;

          // 3.2, 4.3
          if (options.attributeFilter && options.attributeFilter.length &&
              options.attributeFilter.indexOf(name) === -1 &&
              options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          // 3.3, 4.4
          if (options.attributeOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.4, 4.5
          return record;
        });

        break;

      case 'DOMCharacterDataModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
        var target = e.target;

        // 1.
        var record = getRecord('characterData', target);

        // 2.
        var oldValue = e.prevValue;


        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.characterData)
            return;

          // 3.2, 4.3
          if (options.characterDataOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.3, 4.4
          return record;
        });

        break;

      case 'DOMNodeRemoved':
        this.addTransientObserver(e.target);
        // Fall through.
      case 'DOMNodeInserted':
        // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
        var target = e.relatedNode;
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === 'DOMNodeInserted') {
          addedNodes = [changedNode];
          removedNodes = [];
        } else {

          addedNodes = [];
          removedNodes = [changedNode];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;

        // 1.
        var record = getRecord('childList', target);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 2.1, 3.2
          if (!options.childList)
            return;

          // 2.2, 3.3
          return record;
        });

    }

    clearRecords();
  }
};

if (!MutationObserver) {
  MutationObserver = JsMutationObserver;
}

module.exports = MutationObserver;

},{}],8:[function(require,module,exports){
if(typeof(window) === "undefined"){
    var fw = {};
} else var fw = require("./main");
fw.FurryError = class extends Error{};
fw.BadNameError = class extends fw.FurryError{};

// for testing purposes
if(typeof(window) === "undefined"){
    module.exports = {fw}
}

},{"./main":12}],9:[function(require,module,exports){
var parseName = require("./nameParser.js");
/**
 * extract data from a fw-furry object
 *
 * convert it to json
 */
function extractData(furry){
    var inputs = furry.getElementsByTagName('input');
    // supported input types (those not marked TODO)
    // checkbox, color, date, datetime-local, email, file,
    // hidden, image, month, number, password, radio, range,
    // reset - TODO, search, tel, text, time, url, week
    var values = {}
    for(var input of inputs){
        if(!["radio", "checkbox", "submit"].includes(input.type)){
            values[input.name] = input.value;
        } else if(["radio", "checkbox"].includes(input.type)){
            if(input.checked){
                values[input.name] = input.value;
            }
        }
    }

    return values
}

function extractFurryData(furry){
    var rawData = extractData(furry);
    var formattedData = {};

    for(var key in rawData){
        /* I'm converting the keys to proper
           jsons here
        
           later check if all names are numbers
           then convert the json into an array */
        var splitKey = parseName(key);
        console.log(splitKey);
        var trueKey = splitKey[splitKey.length - 1];

        // turn every previous container into a js object
        var currData = formattedData;
        for(var i=0; i<(splitKey.length - 1); i++){
            var name = splitKey[i];
            var nextName = splitKey[i+1];

            // if container is empty
            if(currData[name] == undefined){
                // if not string assume integer
                if(typeof(nextName) == "string") currData[name] = {};
                else currData[name] = [];
            } 
            currData = currData[name];
        }

        // finally assign the last key the value
        if(currData[trueKey] === undefined){
            currData[trueKey] = rawData[key];
        }
        else{
            throw new fw.BadNameError(`one of the keys (${name}) has already been used as a name!, for the name in input ${key}`);
        }
    }
    return formattedData;
}

module.exports = {extractFurryData};

},{"./nameParser.js":13}],10:[function(require,module,exports){
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
                }}}
        }

        this.observer = new MutationObserver(checkForSubmitBtn);
        this.observer.observe(this, {
            childList: true,
            subtree: true
        });

    }

    get action(){
        return this.getAttribute('action');
    }

    set action(val){
        this.setAttribute('action', val);
    }

    handleInputs(input){
      if(input.type == "submit"){
          input.addEventListener('click', () => this.submit())
      }
    }
    
    reportValidity(){
        var inputs = this.currentPage.getElementsByTagName("input");
        var valid = true;
        for(var input of inputs){
            var inp_valid = input.reportValidity();
            if(valid && !inp_valid) valid = false;
        }
        return valid
    }

    checkValidity(){
        var inputs = this.getElementsByTagName("input");
        var valid = true;
        for(var input of inputs){
            var inp_valid = input.checkValidity();
            if(valid && !inp_valid) valid = false;
        }
        return valid
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
        return fetch(this.action, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
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
}
customElements.define("fw-furry", fw.Furry)

},{"./extractData":9,"./main.js":12,"./nameParser.js":13,"html-pages":6}],11:[function(require,module,exports){
var fw = require("./main");
require("./errors")
require("./furry")
require("./waddle")

if(typeof(window) !== "undefined")
    window.furrywaddle = fw;
else{
    module.exports = fw;
}

},{"./errors":8,"./furry":10,"./main":12,"./waddle":14}],12:[function(require,module,exports){
module.exports = {}

},{}],13:[function(require,module,exports){
var fw = require("./main");

function nameParser(name){
    var parts = [];
    var textEnded = false;
    var currPos = 0;

    function gulpChar(){
        var char = name[currPos];
        currPos += 1;
        if(char === undefined){
            textEnded = true;
        }
        return char;
    }

    function parserAssignable(char){
        return ["'","[",'"',"."].includes(char)
    }

    function assignParserForNormalParsing(char){ 
        if(char == '['){
            parseSquareBracket();
            return true
        }
        else if(char == '"'||char == "'"){
            throw new fw.BadNameError("cant have quotes ('\"', \"'\" without square brackets '[]'")
            return true
        }
        else if(char == '.'){
            parseNormal();
            return true
        }
        return false
    }

    function parseNormal(){
        var currText = '';
        while(true){
            var char = gulpChar();

            // break if something else is
            // parsing it
            if(parserAssignable(char)){
                if(currText != '') parts.push(currText);
                assignParserForNormalParsing(char);
                break
            }
            else if(textEnded){
                if(currText != '') parts.push(currText);
                break 
            }
            else{
                currText += char;
            }
        }
    }

    function parseSquareBracket(){
        var currText = '';
        while(true){
            var char = gulpChar();

            // break if text "]"
            if(char == "]"){
                if(currText != '') {
                    // strings get directly pushed
                    // https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number#175787
                    if(isNaN(currText)) parts.push(currText);
                    else {
                        // make sure it isn't a float
                        // https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer
                        var number = parseFloat(currText);
                        if(!(number%1 === 0)){
                            throw new fw.BadNameError(`floating point array values are not allowed, if you want this as a string, quote it!, error number here is ${number}`);
                        }
                        else{
                            parts.push(number);
                        }
                    }
                }
                else throw new fw.BadNameError('empty arrays are not allowed currently in names');
                // in case there is more coming up!
                parseNormal();
                break
            } 
            else if(char == '"'||char=="'"){
                parseString(char);
                var endBracket = gulpChar();
                if(endBracket != "]") throw new fw.BadNameError('missing end square bracket("]") in name after quote')
                // in case there is more
                parseNormal()
                break
            } 
            else if(textEnded){
                throw new fw.BadNameError('open square bracker ("[") without closing square bracket ("]")')
            }
            else{
                currText += char;
            }
        }
        
    }

    /** startQuote must be "'" or '"' indicating the starting type*/
    function parseString(startQuote){
        var currText = '';
        while(true){
            var char = gulpChar();
            if(char == startQuote){
                if (currText === '') throw new fw.BadNameError('name contains empty quoted string, that\'s not allowed')
                else{
                    parts.push(currText);
                    break;
                }
            }
            else if(textEnded){
                throw new fw.BadNameError(`opened quote ${startQuote} without closing it!`);
            }
            else{
                currText += char;
            }
        }
    }

    parseNormal(name);
    return parts
}

module.exports = nameParser

},{"./main":12}],14:[function(require,module,exports){
var fw = require("./main.js");
var pages = require("html-pages");
fw.Waddle = class extends pages.NormalPageElement{
    constructor(){
        super();
    }
}

customElements.define('fw-waddle', fw.Waddle);

},{"./main.js":12,"html-pages":6}]},{},[11]);
