import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this._schedule()
  }

  disconnect() {
    clearTimeout(this._timeout)
  }

  _schedule() {
    this._timeout = setTimeout(() => {
      this.element.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      this.element.style.opacity = "0"
      this.element.style.transform = "translateY(-8px)"
      setTimeout(() => {
        if (this.element.parentNode) this.element.remove()
      }, 500)
    }, 7000)
  }
}
