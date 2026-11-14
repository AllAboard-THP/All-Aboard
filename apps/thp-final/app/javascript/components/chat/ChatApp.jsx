import { useState, useEffect, useRef, useCallback } from "react"
import createConsumer from "../../cable"

export default function ChatApp({ conversationId, currentUser, initialMessages }) {
  const [messages, setMessages]     = useState(initialMessages || [])
  const [input, setInput]           = useState("")
  const [sending, setSending]       = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const [typingTimer, setTypingTimer] = useState(null)
  const bottomRef  = useRef(null)
  const channelRef = useRef(null)
  const csrfToken  = document.querySelector('meta[name="csrf-token"]')?.content

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, peerTyping])

  // Action Cable subscription
  useEffect(() => {
    if (!conversationId) return
    const consumer = createConsumer()
    channelRef.current = consumer.subscriptions.create(
      { channel: "ConversationChannel", conversation_id: conversationId },
      {
        received(data) {
          if (data.type === "typing") {
            if (data.user_id !== currentUser.id) {
              setPeerTyping(data.is_typing)
            }
          } else if (data.type === "message") {
            // Déduplique : ignore si déjà présent (optimistic)
            setMessages(prev => {
              if (prev.some(m => m.id === data.id)) return prev
              return [...prev.filter(m => !m.optimistic || m.body !== data.body), data]
            })
          }
        }
      }
    )
    return () => channelRef.current?.unsubscribe()
  }, [conversationId])

  // Typing indicator
  const handleTyping = useCallback((e) => {
    setInput(e.target.value)
    channelRef.current?.perform("typing", { is_typing: true })
    clearTimeout(typingTimer)
    const t = setTimeout(() => {
      channelRef.current?.perform("typing", { is_typing: false })
    }, 1500)
    setTypingTimer(t)
  }, [typingTimer])

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending) return

    // Optimistic update
    const optimistic = {
      id:         `opt-${Date.now()}`,
      body,
      user_id:    currentUser.id,
      user_name:  currentUser.display_name,
      avatar_url: currentUser.avatar_url,
      created_at: new Date().toISOString(),
      optimistic: true
    }
    setMessages(prev => [...prev, optimistic])
    setInput("")
    setSending(true)
    channelRef.current?.perform("typing", { is_typing: false })

    try {
      const res = await fetch(`/messages/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: { body } })
      })
      if (!res.ok) {
        // Rollback
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        setInput(body)
      }
    } finally {
      setSending(false)
    }
  }

  const isMine = (msg) => msg.user_id === currentUser.id

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}
               className={`flex items-end gap-2 ${isMine(msg) ? "flex-row-reverse" : "flex-row"}`}>
            {!isMine(msg) && (
              <img src={msg.avatar_url} alt={msg.user_name}
                   className="w-7 h-7 rounded-full flex-shrink-0 mb-1" />
            )}
            <div className={`max-w-[70%] ${isMine(msg) ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMine(msg)
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-white/10 text-gray-100 rounded-bl-sm"}
                ${msg.optimistic ? "opacity-70" : "opacity-100"}`}>
                {msg.body}
              </div>
              <span className="text-[10px] text-gray-500 px-1">
                {formatTime(msg.created_at)}
                {msg.optimistic && <span className="ml-1">·</span>}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {peerTyping && (
          <div className="flex items-end gap-2">
            <div className="flex gap-1 bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage}
            className="p-4 border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          placeholder="Écrire un message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary"
          autoComplete="off"
        />
        <button type="submit"
                disabled={!input.trim() || sending}
                className="bg-primary hover:bg-primary/80 disabled:opacity-40 text-white p-3 rounded-full transition-colors flex-shrink-0">
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  )
}
