// Monte les composants React sur les éléments data-react-component
import { createRoot } from "react-dom/client"
import ChatApp from "./components/chat/ChatApp"
import CodeEditor from "./components/code_editor/CodeEditor"
import FeedFilters from "./components/feed/FeedFilters"
import PostForm from "./components/post_form/PostForm"

const COMPONENTS = { ChatApp, CodeEditor, FeedFilters, PostForm }

function mountReactComponents() {
  document.querySelectorAll("[data-react-component]").forEach((el) => {
    const name = el.dataset.reactComponent
    const Component = COMPONENTS[name]
    if (!Component) return

    let props = {}
    try { props = JSON.parse(el.dataset.reactProps || "{}") } catch (_) {}

    if (el._reactRoot) {
      el._reactRoot.render(<Component {...props} />)
    } else {
      el._reactRoot = createRoot(el)
      el._reactRoot.render(<Component {...props} />)
    }
  })
}

// Appel immédiat : les modules ES s'exécutent après le parsing HTML
mountReactComponents()

// Ré-exécute après les navigations Turbo et l'ouverture de modale
document.addEventListener("turbo:load", mountReactComponents)
document.addEventListener("turbo:render", mountReactComponents)
document.addEventListener("modal:opened", mountReactComponents)
document.addEventListener("DOMContentLoaded", mountReactComponents)
