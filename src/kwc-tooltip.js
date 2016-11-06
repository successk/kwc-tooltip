(() => {
  "use strict";
  const currentScript = document._currentScript || document.currentScript;
  const currentDocument = currentScript.ownerDocument;

  const attrMargin = "margin";
  const attrDescription = "description";
  const attrWaitBeforeShowing = "wait-before-showing";
  const attrWaitBeforeHiding = "wait-before-hiding";

  class Timeout {
    constructor(callback, timeout) {
      this.callback = callback;
      this.timeout = timeout;
    }

    start() {
      this.stop();
      if (this.timeout) {
        this._onTimeout = setTimeout(this.callback, this.timeout);
      } else {
        this.callback();
      }
    }

    stop() {
      if (this._onTimeout) {
        clearTimeout(this._onTimeout);
        this._onTimeout = null;
      }
    }
  }

  class KwcTooltip extends HTMLElement {
    static get observedAttributes() {
      return [attrMargin, attrDescription];
    }

    constructor() {
      super();
      this._initializeInternalDom();
      this._timeoutForShowingDescription = new Timeout(() => this._showDescription(), this.waitBeforeShowing);
      this._timeoutForHidingDescription = new Timeout(() => this._hideDescription(), this.waitBeforeHiding);
    }

    connectedCallback() {
      this._initializesEvents();
    }

    attributeChangedCallback(attributeName) {
      if (attributeName === attrDescription) {
        this._descriptionElement.innerHTML = this._htmlDescription;
      } else if (attributeName === attrWaitBeforeShowing) {
        this._timeoutForShowingDescription.timeout = this.waitBeforeShowing;
      } else if (attributeName === attrWaitBeforeHiding) {
        this._timeoutForHidingDescription.timeout = this.waitBeforeHiding;
      }
    }

    _initializeInternalDom() {
      const shadowRoot = this.attachShadow({mode: "open"});
      const template = currentDocument.querySelector("#kwc-tooltip");
      const instance = this._cleanTemplateInstance(template.content);
      shadowRoot.appendChild(instance);
    }

    _initializesEvents() {
      this.addEventListener("mouseover", () => {
        this._timeoutForHidingDescription.stop();
        this._timeoutForShowingDescription.start();
      });
      this.addEventListener("mouseout", () => {
        this._timeoutForShowingDescription.stop();
        this._timeoutForHidingDescription.start();
      });
    }

    _showDescription() {
      this._descriptionElement.style.display = "block";
      const {top, left} = this._getDescriptionPosition();
      this._descriptionElement.style.top = `${top}px`;
      this._descriptionElement.style.left = `${left}px`;
    }

    _hideDescription() {
      this._descriptionElement.style.display = "none";
    }

    _getDescriptionPosition() {
      const top = this.offsetTop + (this.offsetHeight - this._descriptionElement.offsetHeight) / 2;
      const middleOfKwcTooltip = this.offsetLeft + this.offsetWidth / 2;
      const middleOfWindow = window.innerWidth / 2;

      let left;
      if (middleOfKwcTooltip < middleOfWindow) {
        left = this.offsetLeft + this.offsetWidth + this.margin;
      } else {
        left = this.offsetLeft - this._descriptionElement.offsetWidth - this.margin;
      }
      return {top, left};
    }

    /**
     * Removes empty text nodes to avoid extra spaces around component.
     */
    _cleanTemplateInstance(templateInstance) {
      const clonedTemplateInstance = templateInstance.cloneNode(true);
      Array.from(clonedTemplateInstance.childNodes).forEach(node => {
        if (node.nodeName === "#text") {
          if (node.nodeValue.trim() === "") {
            clonedTemplateInstance.removeChild(node);
          } else {
            node.nodeValue = node.nodeValue.trim();
          }
        }
      });
      return clonedTemplateInstance;
    }

    get margin() {
      return this.hasAttribute(attrMargin) ? parseInt(this.getAttribute(attrMargin), 10) : 5;
    }

    set margin(margin) {
      if (margin) {
        this.setAttribute(attrMargin, margin);
      } else {
        this.removeAttribute(attrMargin);
      }
    }

    get description() {
      return this.getAttribute(attrDescription);
    }

    set description(description) {
      if (description) {
        this.setAttribute(attrDescription, description);
      } else {
        this.removeAttribute(attrDescription);
      }
    }

    get waitBeforeHiding() {
      return this.hasAttribute(attrWaitBeforeHiding) ? parseInt(this.getAttribute(attrWaitBeforeHiding), 10) : 0;
    }

    set waitBeforeHiding(waitBeforeHiding) {
      if (waitBeforeHiding) {
        this.setAttribute(attrWaitBeforeHiding, waitBeforeHiding);
      } else {
        this.removeAttribute(attrWaitBeforeHiding);
      }
    }

    get waitBeforeShowing() {
      return this.hasAttribute(attrWaitBeforeShowing) ? parseInt(this.getAttribute(attrWaitBeforeShowing), 10) : 0;
    }

    set waitBeforeShowing(waitBeforeShowing) {
      if (waitBeforeShowing) {
        this.setAttribute(attrWaitBeforeShowing, waitBeforeShowing);
      } else {
        this.removeAttribute(attrWaitBeforeShowing);
      }
    }

    get _descriptionElement() {
      return this.shadowRoot.querySelector("#description");
    }

    get _htmlDescription() {
      let text = this.description.replace(/[\u00A0-\u9999<>\&]/gi, (c) => `&#'${c.charCodeAt(0)}`);
      text = text.replace("\n", "<br/>");
      return text;
    }
  }

  window.onKwcWebComponentLoaded.then(() => window.customElements.define("kwc-tooltip", KwcTooltip));
})();