# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**StudyLink** is a Rails 8.1 peer-tutoring platform where students can ask for help, mentors share resources, and users chat in real time. Key features: subject-based feed, real-time 1:1 messaging (Action Cable + Turbo Streams), mentor program, event aggregation (Ticketmaster API), admin moderation dashboard, and profanity filtering.

## Commands

```bash
# Install dependencies
bundle install && npm install

# Database setup
bin/rails db:create db:migrate db:seed

# Start dev server (web + JS build + background worker)
bin/dev

# Tests
bin/rails test                   # unit tests
bin/rails test:system            # system/integration tests
bin/rails test test/models/user_test.rb  # single test file

# Linting & security
bin/rubocop -f github
bin/brakeman --no-pager
bin/bundler-audit
```

## Architecture

### Tech Stack
- **Rails 8.1**, SQLite3, Solid Queue/Cache/Cable (database-backed)
- **Asset pipeline**: esbuild (via jsbundling-rails) + Propshaft (no Webpacker/Sprockets)
- **Real-time**: Turbo Streams for DOM updates + Action Cable for WebSocket messaging
- **Auth**: Devise with email confirmation + CGU acceptance gate
- **Deployment**: Kamal + Docker

### Key Models
- **User** — role enum (`user`/`admin`), `mentor` boolean flag, avatar via Active Storage
- **Post** — belongs to User + Subject; has `code_language`, `status` (open/resolved), `urgency`, `mentor_help_requested`, `flagged_for_moderation`
- **Comment** — belongs to Post + User; can have a code snippet; same moderation flag
- **Conversation** — 1:1 chat identified by `direct_key`; `has_many :users, through: :participants`
- **Message** — belongs to Conversation + User; broadcasts via `broadcast_to_conversation`
- **Resource** — mentor-created educational material; status (`pending`/`published`/`rejected`)
- **Event** — tech events fetched from Ticketmaster; stored via `EventCandidate` → `Event` flow
- **DenylistPattern** — admin-configurable regex patterns for content moderation

### Controllers & Namespaces
- **Root namespace** — authenticated user actions: feed, posts, comments, likes, bookmarks, conversations/messages, resources, explore, subject_requests, users
- **`Admin::`** — dashboard, moderation queue, denylist patterns, user/post management, event candidates, subject requests
- **`Mentor::`** — dashboard, resource CRUD

### Real-time Patterns
Turbo Streams broadcasts happen inside model callbacks or controller actions (e.g., after creating a comment or toggling a like). Action Cable is used specifically for chat messages. Look at `app/models/message.rb` and `app/views/messages/` for the pattern.

### ProfanityFilter Concern
`app/models/concerns/profanity_filter.rb` — auto-flags posts/comments on save if content matches hardcoded banned words or any `DenylistPattern` regex. Applied to Post and Comment via `include ProfanityFilter`.

### Background Jobs & Mailers
- **FetchTechEventsJob** — fetches tech events via Claude API + web search, runs weekly via Solid Queue
- **NotificationMailer** — sends emails for new messages, new comments, and mentor help requests; previewed in dev via `letter_opener`

### Secrets & Environment Variables
Secrets are stored in **Rails encrypted credentials** (`config/credentials.yml.enc`). The only variable needed in production is:
```
RAILS_MASTER_KEY=   # decrypts config/credentials.yml.enc
```

Credentials stored (edit via `bin/rails credentials:edit`):
- `anthropic_api_key` — Claude API key
- `admin_setup_key` — one-time admin creation key
- `secret_key_base` — Rails session secret

For local dev, a `.env` file (gitignored) with `ANTHROPIC_API_KEY` and `ADMIN_SETUP_KEY` also works as fallback.

### CI Pipeline (`.github/workflows/ci.yml`)
Runs on PRs to `main`: Brakeman → bundler-audit → RuboCop → Rails tests → System tests (with screenshot artifacts on failure).
