import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["message"]
  static values = { currentUserId: Number }

  connect() {
    this.refresh()
  }

  messageTargetConnected(target) {
    this.decorate(target)
    this.scrollToBottom()
  }

  refresh() {
    this.messageTargets.forEach((target) => this.decorate(target))
    this.scrollToBottom()
  }

  decorate(target) {
    const ownMessage = Number(target.dataset.authorId) === this.currentUserIdValue

    target.classList.toggle("chat-row--own", ownMessage)
    target.classList.toggle("chat-row--other", !ownMessage)
  }

  scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight
  }
}
