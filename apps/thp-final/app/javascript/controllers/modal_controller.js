import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dialog"]

  open(event) {
    event?.preventDefault()
    const modalId = event?.currentTarget?.dataset?.modalId
    const target = modalId ? document.getElementById(modalId) : this.dialogTarget
    target?.classList.remove("hidden")
    document.body.style.overflow = "hidden"
    document.dispatchEvent(new CustomEvent("modal:opened"))
  }

  close(event) {
    event?.preventDefault()
    const container = event?.currentTarget?.closest("[data-modal-container]")
    if (container) {
      container.classList.add("hidden")
    } else if (this.hasDialogTarget) {
      this.dialogTarget.classList.add("hidden")
    }
    document.body.style.overflow = ""
  }

  closeOnEscape(event) {
    if (event.key !== "Escape") return
    document.querySelectorAll("[data-modal-container]:not(.hidden)").forEach(el => el.classList.add("hidden"))
    if (this.hasDialogTarget && !this.dialogTarget.classList.contains("hidden")) {
      this.dialogTarget.classList.add("hidden")
    }
    document.body.style.overflow = ""
  }
}
