# Narrated screen recordings and video annotations

**Status:** product decisions, 2026-11-24. **API built** (contract in [web-api-integration.md](../guides/web-api-integration.md#video-annotations-197), OpenAPI 0.13.0). **Web not built.** Issue: [#197](https://github.com/AllAboard-THP/All-Aboard/issues/197).  
**Builds on:** async chat media (audio and video messages, [ADR 0008](../adr/0008-message-media-object-storage.md), storage in [message-media-storage.md](../deployment/message-media-storage.md)).

This page is the product source of truth for two chat features:

1. **Narrated screen recording**: a video message of the user's screen, with their voice explaining what they show.
2. **Video annotations**: a question or remark pinned to a moment of a video message, optionally on a rectangle of the frame, with a reply thread.

---

## Why

A student stuck on a bug, or a mentor reviewing work, explains faster by showing the screen and talking than by writing. The chat can already record the screen, but it only captures the sound of the shared screen, not the microphone, so nobody can talk over it.

The person who watches the video then needs to ask about a precise moment ("what did you click at 0:42?"). Today they must write the time by hand in a text message. Annotations attach the question to the moment, and to the part of the screen, and keep the answer next to it.

---

## Decisions (2026-11-24)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Audio sources of a screen recording | **Microphone + screen sound, mixed.** Each source can be muted before recording |
| 2 | Limits of a screen recording | **5 min / 100 MB.** Camera videos keep 3 min / 50 MB, voice messages 5 min / 10 MB |
| 3 | Which messages can be annotated | **Every video message**, screen and camera. Not voice messages |
| 4 | Who can annotate | **Both participants** of the conversation, the video's author included |
| 5 | Annotation forms | **Timestamp only**, or **timestamp + rectangle** drawn on the paused frame |
| 6 | Replies | **A thread under each annotation**, with a *resolved* state |
| 7 | Mobile | **No screen recording button** (mobile browsers cannot record the screen). Watching and annotating work, rectangle drawn by touch |
| 8 | Notifications | **Live update** over the conversation WebSocket, and an **unread annotations badge** on the video message |

Defaults taken with these decisions (change them here if needed):

| Topic | Default |
| --- | --- |
| Edit and delete | Only the author of an annotation or reply can edit or delete it |
| Delete with replies | Soft delete: the text becomes "Deleted annotation", the marker and the replies stay |
| Resolve | Either participant can mark an annotation resolved, or reopen it |
| Playback while annotating | Starting an annotation pauses the video |
| Moderation | Same as chat text: **none** for now. The chat is a private 1:1 space and its messages are not moderated (corrected 2026-11-24 while building the API) |

---

## Journey

**Record**

1. In a conversation, on a computer, the user opens the recorder and picks **Screen**.
2. Two switches, both on by default: **Microphone** and **Screen sound**.
3. The browser asks which screen, window or tab to share, and for the microphone if not already granted.
4. The user talks while showing the screen. A timer shows the remaining time (5 min). Stop, then preview, then send, as for the other media messages.

**Annotate**

1. The other participant plays the video. They pause at the moment that raises a question.
2. They click **Annotate**. The video stays paused at the current time.
3. Optional: they drag a rectangle on the frame to point at the area concerned.
4. They type the question and send. A marker appears on the progress bar at that time.
5. The author of the video gets the marker live, and a badge "1 new annotation" on the message.
6. The author opens the annotation: the video jumps to the time, the rectangle shows over the frame, and the thread opens. They reply. The asker marks it resolved once answered.

---

## Recording: audio mix

`getDisplayMedia({ video: true, audio: true })` returns the screen sound only. The microphone comes from a separate `getUserMedia({ audio: true })`.

The recorder mixes both audio tracks into one with the Web Audio API (`AudioContext` → two `MediaStreamAudioSourceNode` → one `MediaStreamAudioDestinationNode`). The recorded stream is the screen video track plus the mixed audio track. MediaRecorder records a single audio track, so the mix is required.

Screen sound depends on the browser and the system:

| Case | Behaviour |
| --- | --- |
| Chrome / Edge, sharing a tab | Tab sound available |
| Chrome / Edge on Windows, sharing the whole screen | System sound available |
| Chrome on macOS outside a tab, Firefox, Safari | No screen sound. The recording keeps the microphone only, and a hint says so once the share starts |
| Screen sound switch off | The screen audio track, if any, is stopped and not mixed |
| Microphone refused | The user can record without voice (screen sound only) after a warning, or cancel |
| Both off or unavailable | The recording is silent. Allowed, with the warning |

All tracks (screen, microphone, mix) stop when the recording ends, when the share is stopped from the browser bar, or when the user leaves the conversation.

---

## Limits

| Message | Max duration | Max size |
| --- | --- | --- |
| Voice (`microphone`) | 5 min | 10 MB |
| Camera video (`camera`) | 3 min | 50 MB |
| **Screen recording (`screen`)** | **5 min** | **100 MB** |

The limit depends on `attachment_source`, which already exists. The API enforces it on upload, as it does today for kind. The client declares the source, so a camera video sent as `screen` gets the larger limit. That is accepted: the cap is about storage cost, not trust.

The Fastify multipart `fileSize` limit is global and set to the video maximum today. It must go up to 100 MB. The BFF upload route and the Dokploy proxy must accept 100 MB bodies too (to check in the API slice).

---

## Annotations: data model

**`message_annotations`**

| Column | Notes |
| --- | --- |
| `id` | uuid |
| `message_id` | FK `messages`, cascade delete. Must be a `video` message |
| `author_id` | FK `users`. A participant of the message's conversation |
| `at_ms` | Integer ≥ 0. Not above the message's `attachment_duration_ms` when it is known |
| `rect_x`, `rect_y`, `rect_w`, `rect_h` | Nullable reals in [0, 1], relative to the **video frame** (not the player box). All four null, or all four set with `w > 0`, `h > 0`, `x + w ≤ 1`, `y + h ≤ 1` |
| `body` | Text, 1 to 1000 characters |
| `resolved_at`, `resolved_by` | Nullable. Set and cleared by either participant |
| `edited_at`, `deleted_at` | Nullable. Soft delete keeps the row and its replies |
| `created_at`, `updated_at` | |

Index on `(message_id, at_ms)`.

**`message_annotation_replies`**

| Column | Notes |
| --- | --- |
| `id` | uuid |
| `annotation_id` | FK `message_annotations`, cascade delete |
| `author_id` | FK `users`. A participant of the conversation |
| `body` | Text, 1 to 1000 characters |
| `edited_at`, `deleted_at`, `created_at`, `updated_at` | Same rules as annotations |

**`message_annotation_reads`**: one row per `(message_id, user_id)` with `last_read_at`. Unread count for a user on a message = annotations and replies on that message, written by someone else, created after `last_read_at`. Opening the annotations of a message marks it read.

Relative coordinates keep the rectangle in place at any player size. The player uses `object-fit: contain`, so the overlay must be placed over the video content box, inside the letterbox bars, from `videoWidth` / `videoHeight`.

---

## API

All routes require a session and check that the user is a participant of the conversation. They return 404 for a message or annotation outside the user's conversations.

| Method and route | Purpose |
| --- | --- |
| `GET /conversations/:id/messages/:messageId/annotations` | Annotations of a video message, sorted by `at_ms`, with their replies |
| `POST /conversations/:id/messages/:messageId/annotations` | Create `{ atMs, rect?, body }`. 400 `not_a_video_message` on other kinds |
| `PATCH /annotations/:annotationId` | `{ body }` (author only) or `{ resolved: boolean }` (either participant) |
| `DELETE /annotations/:annotationId` | Soft delete, author only |
| `POST /annotations/:annotationId/replies` | Create `{ body }` |
| `PATCH /annotation-replies/:replyId`, `DELETE /annotation-replies/:replyId` | Edit, soft delete. Author only |
| `PATCH /conversations/:id/messages/:messageId/annotations/read` | Mark the message's annotations read |

`ChatMessage` gains, for video messages, `annotationCount` and `unreadAnnotationCount` (for the current user). No rate limit, like the message send route. OpenAPI 0.13.0.

**WebSocket.** The conversation socket sends bare `ChatMessage` objects today, which already carry `type: "message"`. New events use other `type` values, so a client that ignores unknown types keeps working while the web and the API deploy separately:

| `type` | Payload |
| --- | --- |
| `annotation.created`, `annotation.updated`, `annotation.deleted` | `{ type, messageId, annotation }` |
| `annotation_reply.created`, `annotation_reply.updated`, `annotation_reply.deleted` | `{ type, messageId, annotationId, reply }` |

The receiving client updates the markers and raises the unread badge unless the annotations panel of that message is open.

---

## Web

**Recorder** (`packages/ui` hook `useMediaRecorder`, `screen` mode)

- Microphone and screen sound switches before the share starts, both on.
- Audio mix as above. The current `screenCaptureSupported` check already hides the Screen button where `getDisplayMedia` does not exist, mobile included.
- 5 min countdown for screen mode.

**Video player** (chat video message)

- Markers on the progress bar at each annotation's `at_ms`. Resolved markers are dimmed. Keyboard focusable, with the time and the first words as label.
- **Annotate** button: pauses, then opens the composer at the current time. The time can be adjusted in the composer (± 1 s, or typed `m:ss`), so an annotation can be created on a timestamp without seeking precisely.
- **Rectangle**: in the composer, "Point at an area" turns the paused frame into a drawing surface. Drag (mouse or touch) to draw, drag again to replace, Esc or "Remove area" to clear.
- Clicking a marker seeks to its time, pauses, shows its rectangle over the frame and opens its thread.
- Annotations panel under the player (a sheet on mobile): list sorted by time, each with its thread, reply box, Resolve / Reopen, Edit, Delete.
- Unread badge on the message bubble, cleared when the panel opens.

Strings in French and English (next-intl). Primitives in `packages/ui`, chat wiring in `apps/web`, stories for the player states.

---

## Delivery

1. **API**: migration (three tables), limits by source, routes, WebSocket events, `ChatMessage` counts, OpenAPI, tests.
2. **Web**: audio mix in the recorder, player markers and rectangle overlay, annotations panel, live updates, i18n, stories.

---

## Out of scope

- Annotations on voice messages.
- Drawing shapes other than a rectangle, arrows or free-hand.
- Trimming or editing the recording before sending.
- Screen recording on mobile (not possible in mobile browsers).
- Email or push notifications outside the app.
- Retention: media objects in R2 are still never deleted with their message (see [message-media-storage.md](../deployment/message-media-storage.md)). Annotations go with their message (cascade).
