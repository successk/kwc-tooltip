(() => {
  "use strict";
  const currentScript = document._currentScript || document.currentScript;
  const currentDocument = currentScript.ownerDocument;

  const attrMargin = "margin";
  const attrDescription = "description";

  class KwcTooltip extends HTMLElement {
    static get observedAttributes() {
      return [attrMargin, attrDescription];
    }

    constructor() {
      super();
      this._initializeInternalDom();
    }

    connectedCallback() {
      this._initializesEvents();
    }

    attributeChangedCallback(attributeName) {
      if (attributeName === attrDescription) {
        this._descriptionElement.innerHTML = this._htmlDescription;
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
        this._descriptionElement.style.display = "block";
        const {top, left} = this._getDescriptionPosition();
        this._descriptionElement.style.top = `${top}px`;
        this._descriptionElement.style.left = `${left}px`;
      });
      this.addEventListener("mouseout", () => {
        this._descriptionElement.style.display = "none";
      });
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
      this.setAttribute(attrMargin, margin);
    }

    get description() {
      return this.getAttribute(attrDescription);
    }

    set description(description) {
      this.setAttribute(attrDescription, description);
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