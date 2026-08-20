import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "file", "preview", "filename"]

  reset(event) {
    if (!event.detail.success) return
    this.element.reset()
    this.inputTarget.focus()
    this.hidePreview()
  }

  openFile() {
    this.fileTarget.click()
  }

  connect() {
    this.fileTarget?.addEventListener("change", () => this.onFileChange())
  }

  onFileChange() {
    const file = this.fileTarget.files[0]
    if (!file) { this.hidePreview(); return }
    this.filenameTarget.textContent = file.name
    this.previewTarget.classList.remove("hidden")
    this.previewTarget.classList.add("flex")
  }

  clearFile() {
    this.fileTarget.value = ""
    this.hidePreview()
  }

  hidePreview() {
    if (this.hasPreviewTarget) {
      this.previewTarget.classList.add("hidden")
      this.previewTarget.classList.remove("flex")
    }
  }
}
