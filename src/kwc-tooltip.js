(() => {
  "use strict";

  class KwcTooltip {
    beforeRegister() {
      this.is = "kwc-tooltip";

      this.properties = {
        description: {
          type: String,
          value: null
        },
        margin: {
          type: Number,
          value: 5
        },
        htmlDescription: {
          type: String,
          computed: "_computeHtmlDescription(description)",
          observer: "_htmlDescriptionChanged"
        }
      };
    }

    attachedCallback() {
      this.addEventListener("mouseover", () => {
        this.$.description.style.display = "block";

        const top = this.offsetTop + (this.offsetHeight - this.$.description.offsetHeight) / 2;
        const middle = this.offsetLeft + this.offsetWidth / 2;
        let left;
        if (middle < window.innerWidth / 2) {
          left = this.offsetLeft + this.offsetWidth + this.margin;
        } else {
          left = this.offsetLeft - this.$.description.offsetWidth - this.margin;
        }
        this.$.description.style.top = `${top}px`;
        this.$.description.style.left = `${left}px`;
      });
      this.addEventListener("mouseout", () => {
        this.$.description.style.display = "none";
      });
    }

    _computeHtmlDescription(description) {
      let text = description.replace(/[\u00A0-\u9999<>\&]/gi, (c) => `&#'${c.charCodeAt(0)}`);
      text = text.replace("\n", "<br/>");
      return text;
    }

    _htmlDescriptionChanged(description) {
      this.querySelector("#description").innerHTML = description;
    }
  }

  Polymer(KwcTooltip);
})();