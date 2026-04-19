# 📚 College Alumni Networking & Mentorship Platform — Reference Document
> This file is the **single source of truth** for the AI agent across all phases.
> Always read this file before executing any phase prompt.

---

## 🎯 Project Identity

**Project Name:** AlumniConnect — College Alumni Networking & Mentorship Platform
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js)
**UI Library:** Chakra UI (primary), with custom CSS for design accents
**Auth:** JWT-based authentication with role-based access control
**Communication:** REST API between frontend and backend

---

## 🎨 UI / Design Vision

The UI is inspired by a clean, modern tutoring/professional platform with the following characteristics:

- **Layout style:** Card-based grid layouts for browsing profiles and opportunities, with prominent hero sections on landing pages
- **Color palette:** Soft pastel gradients (lavender/blush/white) for backgrounds, with vibrant accent colors (coral/pink or teal) for tags, badges, and CTAs
- **Typography:** Large, bold headings with light body text; clear hierarchy
- **Components:** Profile cards with avatar, role badge (colored tag), name, stats (connections, mentorships), and rating/star indicators
- **Sections visible in the reference image:**
  - Top navigation bar with links and Login / Sign Up buttons
  - Hero section with headline, subtext, CTA button, and illustrative graphic
  - Feature highlight sections with illustration + text side-by-side
  - Browseable card grids (tutors/alumni) with category tags, stats, and ratings
  - Testimonial slider section (dark background, star ratings)
  - CTA banner section at the bottom with a "Get Started" action
- **Tone:** Professional yet friendly, clean whitespace, soft shadows on cards, rounded corners throughout
- **Illustrations:** Use SVG illustrations or Lottie animations for hero and feature sections (e.g., undraw.co or storyset.com style)

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Student** | Register, create profile, search/browse alumni, send mentorship requests, view/apply to opportunities, message mentors |
| **Alumni** | Register, create profile, accept/reject mentorship requests, post job/internship opportunities, message students |
| **Admin** | View all users, manage accounts, view platform analytics, moderate content |

---

## 🗂️ Core Features (Feature Map)

### Authentication Module
- User signup (Student or Alumni role selection)
- User login
- JWT token issuance and storage
- Protected routes by role

### Profile Module
- Create and edit personal profile
- Fields: name, bio, profile photo (avatar), skills (tags), industry, graduation year, current company/role, experience
- Public profile view page

### Alumni Discovery Module
- Browse all alumni with filters (industry, skills, graduation year)
- Search by name or keyword
- Alumni profile cards with key stats

### Mentorship Request Module
- Student sends a mentorship request with a personal message
- Alumni views incoming requests (Pending / Accepted / Rejected)
- Status tracking for students
- Accepted requests form active mentorships

### Messaging Module
- In-platform messaging between connected users (student ↔ alumni)
- Conversation list + chat window interface
- Messages stored per sender/receiver pair

### Opportunity Sharing Module
- Alumni post job or internship opportunities
- Students browse the opportunities board
- Each posting shows: title, company, description, posted by (alumni name), date

### Admin Dashboard Module
- Overview stats (total users, requests, opportunities)
- User list with role management
- Content moderation tools

---

## 🗃️ Data Models (MongoDB Collections)

### `users`
```
_id, name, email, password (hashed), role, bio, skills[], industry,
graduationYear, company, experience, profilePhoto, createdAt
```

### `mentorshipRequests`
```
_id, studentId (ref: users), alumniId (ref: users), message,
status (pending|accepted|rejected), requestedAt
```

### `opportunities`
```
_id, title, description, company, type (job|internship),
postedBy (ref: users), createdAt
```

### `messages`
```
_id, senderId (ref: users), receiverId (ref: users), content, sentAt
```

---

## 🔌 API Route Map (High-Level)

| Module | Method | Endpoint |
|---|---|---|
| Auth | POST | /api/auth/register |
| Auth | POST | /api/auth/login |
| Auth | GET | /api/auth/me |
| Users | GET | /api/users (alumni list) |
| Users | GET | /api/users/:id |
| Users | PUT | /api/users/:id |
| Mentorship | POST | /api/mentorship |
| Mentorship | GET | /api/mentorship/received |
| Mentorship | GET | /api/mentorship/sent |
| Mentorship | PUT | /api/mentorship/:id |
| Opportunities | GET | /api/opportunities |
| Opportunities | POST | /api/opportunities |
| Opportunities | DELETE | /api/opportunities/:id |
| Messages | GET | /api/messages/:userId |
| Messages | POST | /api/messages |
| Admin | GET | /api/admin/users |
| Admin | DELETE | /api/admin/users/:id |

---

## 🧩 Page / Screen Inventory

### Public Pages (no auth required)
- `/` — Landing / Home page
- `/login` — Login page
- `/register` — Register page

### Student Pages (Student role)
- `/dashboard` — Student dashboard with summary cards
- `/alumni` — Browse alumni directory
- `/alumni/:id` — Alumni public profile
- `/mentorship` — My mentorship requests (sent, status)
- `/opportunities` — Browse job/internship board
- `/messages` — Messaging inbox + chat window
- `/profile` — Edit own profile

### Alumni Pages (Alumni role)
- `/dashboard` — Alumni dashboard
- `/mentorship/requests` — Incoming mentorship requests
- `/opportunities/manage` — Post and manage opportunities
- `/messages` — Messaging inbox + chat window
- `/profile` — Edit own profile

### Admin Pages (Admin role)
- `/admin/dashboard` — Admin overview
- `/admin/users` — Manage all users
- `/admin/opportunities` — View all opportunities

---

## 🔗 Phase Execution Order

| Phase | Name | Depends On |
|---|---|---|
| 1 | Project Setup & Authentication | None |
| 2 | User Profiles | Phase 1 |
| 3 | Landing Page & Navigation | Phase 1 |
| 4 | Alumni Discovery | Phase 2 |
| 5 | Mentorship Request System | Phase 2, 4 |
| 6 | Messaging System | Phase 5 |
| 7 | Opportunity Sharing Board | Phase 2 |
| 8 | Admin Dashboard | Phase 1–7 |
| 9 | Polish, Animations & Responsive Design | Phase 1–8 |

---

## ✅ Non-Negotiable Implementation Rules

1. **Always use JWT** for protecting backend routes — attach token in `Authorization: Bearer <token>` header
2. **Role-based guards** must be applied both on the backend (middleware) and frontend (route protection)
3. **Chakra UI** is the primary component library — use its theme system for consistent colors/fonts
4. **All API calls** from the frontend go through an Axios instance with a base URL and interceptors for auth headers
5. **Passwords** are always hashed with bcrypt before storing in MongoDB
6. **Error handling** must be present on both frontend (toast notifications via Chakra UI) and backend (consistent JSON error responses)
7. **No hardcoded data** — all content comes from MongoDB via API calls
8. **Environment variables** are used for all secrets (JWT secret, MongoDB URI, port)
9. The design must be **fully responsive** — mobile, tablet, desktop
10. All forms must have **client-side validation** before submission

---

## 🎨 Chakra UI Theme Tokens (to use consistently)

- **Primary color:** `teal` (Chakra built-in) — used for CTA buttons, active states, links
- **Accent color:** `pink` / `#FF6B8A` — used for role badges (Student), tags
- **Alumni badge color:** `purple` — used for Alumni role indicators
- **Admin badge color:** `orange`
- **Background:** `gray.50` for page backgrounds, `white` for cards
- **Card shadow:** `md` shadow with `rounded: xl` border radius
- **Font:** Use Chakra's default font stack but override heading font with a distinctive Google Font (e.g., `"Sora"` or `"DM Sans"`)

---

*Keep this reference.md open at all times during development. Each phase prompt will reference sections of this document.*
