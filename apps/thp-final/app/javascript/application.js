// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

function autoDismissFlash() {
  document.querySelectorAll(".flash-toast").forEach((el) => {
    if (el.dataset.dismissScheduled) return
    el.dataset.dismissScheduled = "true"
    setTimeout(() => {
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      el.style.opacity = "0"
      el.style.transform = "translateY(-8px)"
      setTimeout(() => el.remove(), 500)
    }, 7000)
  })
}

document.addEventListener("turbo:load", autoDismissFlash)
document.addEventListener("turbo:render", autoDismissFlash)
document.addEventListener("DOMContentLoaded", autoDismissFlash)
