import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["title", "body", "tagList", "suggestions", "loading"]

  connect() {
    this._debounceTimer = null
  }

  onBlur() {
    clearTimeout(this._debounceTimer)
    this._debounceTimer = setTimeout(() => this.fetchSuggestions(), 300)
  }

  async fetchSuggestions() {
    const title = this.hasTitleTarget ? this.titleTarget.value.trim() : ""
    const body  = this.hasBodyTarget  ? this.bodyTarget.value.trim()  : ""

    if (title.length + body.length < 10) return

    this.loadingTarget.classList.remove("hidden")
    this.suggestionsTarget.innerHTML = ""

    try {
      const token = document.querySelector('meta[name="csrf-token"]').content
      const res = await fetch(this.element.dataset.suggestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
          "Accept": "application/json"
        },
        body: JSON.stringify({ title, body })
      })

      if (!res.ok) return

      const data = await res.json()
      this.renderSuggestions(data.tags || [])
    } catch (_e) {
      // silently ignore network errors
    } finally {
      this.loadingTarget.classList.add("hidden")
    }
  }

  renderSuggestions(tags) {
    if (tags.length === 0) return

    this.suggestionsTarget.innerHTML = tags.map(tag =>
      `<button type="button"
               class="tag-chip px-2.5 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
               data-action="click->tag-suggest#addTag"
               data-tag="${this.escapeHtml(tag)}">
        <i class="fas fa-plus text-[9px] mr-1"></i>${this.escapeHtml(tag)}
      </button>`
    ).join("")
  }

  addTag(event) {
    const tag = event.currentTarget.dataset.tag
    const field = this.tagListTarget
    const existing = field.value.split(",").map(t => t.trim()).filter(Boolean)

    if (!existing.includes(tag) && existing.length < 6) {
      existing.push(tag)
      field.value = existing.join(", ")
    }

    // Remove this chip
    event.currentTarget.remove()
    if (this.suggestionsTarget.children.length === 0) {
      this.suggestionsTarget.innerHTML = ""
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }
}
