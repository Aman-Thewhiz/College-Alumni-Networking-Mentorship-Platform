# 🚀 AlumniConnect — Phased Build Prompts for AI Agent
> **HOW TO USE THIS FILE:**
> - Execute one phase at a time. Do not skip phases.
> - Before every phase, re-read `reference.md` completely.
> - Each phase begins with a **Context Block** summarizing what was built before.
> - Paste the full phase prompt (including its context block) to your AI agent.
> - Do not combine phases in a single prompt.

---

---

# ⚡ PHASE 1 — Project Setup & Authentication System

## 📌 Context Block
> This is the **first phase** of the AlumniConnect project. Nothing has been built yet.
> Read `reference.md` to understand the full project — its name, purpose, roles, tech stack, and design vision before starting.

## 🎯 Goal
Establish the complete project foundation: monorepo folder organization, backend server with database connection, and a fully working authentication system (register + login + protected route middleware), plus the React frontend bootstrapped with routing and a global Axios setup.

## 📋 What to Build

### Backend
- Initialize a Node.js + Express.js backend project with all required dependencies installed
- Connect to MongoDB using Mongoose with a connection utility
- Create the `User` model/schema exactly as described in the Data Models section of `reference.md`
- Build the Auth API routes as defined in the API Route Map in `reference.md`:
  - `POST /api/auth/register` — accepts name, email, password, role (Student or Alumni); hashes password with bcrypt; returns JWT
  - `POST /api/auth/login` — validates credentials; returns JWT with user payload (id, name, role)
  - `GET /api/auth/me` — protected route; returns the currently authenticated user's profile
- Create a JWT authentication middleware that verifies the token from the `Authorization: Bearer` header and attaches the user to the request
- Create a role-based authorization middleware that accepts allowed roles as arguments
- Set up environment variable loading via dotenv (JWT_SECRET, MONGO_URI, PORT)
- Implement consistent JSON error response structure across all routes: `{ success: false, message: "..." }`
- Enable CORS for the frontend origin

### Frontend
- Initialize a React project (Vite or Create React App)
- Install and configure Chakra UI with a custom theme — apply the design tokens described in the Chakra UI Theme Tokens section of `reference.md` (primary teal, pink accent, DM Sans or Sora heading font via Google Fonts)
- Set up React Router with placeholder routes for all pages listed in the Page / Screen Inventory section of `reference.md`
- Create a global Axios instance with the backend base URL and a request interceptor that automatically attaches the JWT token from localStorage to every request header
- Build the **Login Page** — form with email and password fields, Chakra UI form controls with validation, submit calls the login API, stores token and user info in localStorage, redirects to the correct dashboard based on role
- Build the **Register Page** — form with name, email, password, and a role selector (Student / Alumni toggle or radio group), styled with Chakra UI, submits to register API then redirects to login
- Create an Auth Context (React Context API) that provides: current user object, login function, logout function, and a loading state
- Build a `ProtectedRoute` component that checks auth and role before rendering a route, redirects to `/login` if unauthorized
- Apply `ProtectedRoute` to all dashboard and feature pages (placeholders for now)
- Show Chakra UI toast notifications for login errors, registration success, and validation errors

## ✅ Phase 1 Completion Criteria
- A user can register as Student or Alumni and receive a JWT
- A user can log in and be redirected to their role-specific dashboard route
- The JWT is stored and sent automatically in API headers
- Unauthorized access to protected routes redirects to login
- All environment variables are used — no hardcoded secrets

---

---

# ⚡ PHASE 2 — User Profile System

## 📌 Context Block
> **Phase 1 is complete.** The project has:
> - A running Express.js backend connected to MongoDB
> - JWT authentication with register/login endpoints
> - Role-based middleware for protecting routes
> - A React frontend with Chakra UI, React Router, Auth Context, and a global Axios instance
> - Protected route wrapper applied to all dashboard pages
> - Working Login and Register pages
>
> Read `reference.md` for the User data model, role definitions, page inventory, and design vision before continuing.

## 🎯 Goal
Build the complete user profile system — backend CRUD API for profiles and two frontend screens: a profile editor (for self) and a public-facing profile view page.

## 📋 What to Build

### Backend
- Build the Users API routes as specified in the API Route Map in `reference.md`:
  - `GET /api/users/:id` — returns a user's public profile data (exclude password)
  - `PUT /api/users/:id` — protected; allows a user to update only their own profile; accepts fields from the User model in `reference.md` (bio, skills, industry, graduationYear, company, experience, profilePhoto URL)
- Add server-side validation ensuring a user can only update their own profile (compare req.user.id with :id param)

### Frontend
- Build the **Edit Profile Page** (`/profile`):
  - A form-based page where the logged-in user can update all editable profile fields from the User model in `reference.md`
  - Skills field should allow adding/removing multiple tags (use Chakra UI Tag component)
  - Profile photo field accepts a URL string (image URL input)
  - Show a live avatar preview using Chakra UI Avatar component
  - On save, call `PUT /api/users/:id` and show a success toast
- Build the **Public Alumni Profile Page** (`/alumni/:id`):
  - Displays a complete profile view for any user (primarily used to view alumni)
  - Layout: large avatar at top with name, role badge (colored by role as per `reference.md` theme tokens), industry, company, and graduation year
  - Below: bio section, skills displayed as Chakra UI tags/badges, experience section
  - A prominent "Request Mentorship" button (for Students only — hide for Alumni viewing another profile)
  - A "Send Message" button (visible only for authenticated users who have an accepted mentorship connection — placeholder behavior for now, wire up in Phase 5/6)
  - Design the card/profile header with a soft gradient background consistent with the design vision in `reference.md`
- Update both Student and Alumni dashboards with a "Complete Your Profile" prompt card if profile fields are incomplete

## ✅ Phase 2 Completion Criteria
- A logged-in user can update their own profile and see changes persist
- Any authenticated user can view another user's public profile at `/alumni/:id`
- Skills render as removable tags in the editor and read-only badges on the public view
- Role badges are color-coded correctly per `reference.md` theme tokens
- The "Request Mentorship" CTA is visible only to Students on an Alumni profile page

---

---

# ⚡ PHASE 3 — Landing Page & Main Navigation

## 📌 Context Block
> **Phases 1 and 2 are complete.** The project now has:
> - Full authentication system (register, login, JWT, protected routes)
> - User profile editor and public profile view page
> - Role-based access control on both backend and frontend
>
> Read `reference.md` — especially the UI/Design Vision section — before building this phase. The landing page is the most design-intensive screen.

## 🎯 Goal
Build the public-facing landing page and the persistent navigation bar. This phase is **heavily design-focused** — the landing page must match the visual style described in `reference.md`'s UI/Design Vision section, taking direct inspiration from the reference image provided.

## 📋 What to Build

### Navigation Bar (all pages)
- Persistent top navigation with the platform logo/name on the left
- Navigation links: Home, Browse Alumni, Opportunities, About
- Right side: "Log In" text link and "Sign Up" filled button (teal, rounded)
- When a user is authenticated: replace auth buttons with a user avatar menu (Chakra UI Menu) showing "Dashboard", "Profile", and "Logout" options
- Navigation should be sticky on scroll with a subtle white/frosted background
- Fully responsive — collapse to a hamburger menu on mobile using Chakra UI Drawer

### Landing Page (`/`)
Build the following sections in order, styled per the design vision in `reference.md`:

**Hero Section**
- Bold large heading (e.g., "Find your perfect mentor, easily")
- Subheading paragraph describing the platform's value proposition
- "Get Started" CTA button (teal, large, with arrow icon) linking to `/register`
- A secondary stat line (e.g., "Over 500 alumni ready to mentor →") with a star icon
- An illustrative graphic or SVG on the right side (use a relevant SVG illustration)
- Background: soft pastel gradient mesh (lavender to blush/white) matching the reference image

**Feature Highlight Section 1**
- Left: an illustration of people communicating
- Right: heading "Connect with alumni mentors" + description paragraph + "Browse Alumni" button

**Feature Highlight Section 2**
- Left: bold heading "Discover opportunities posted by alumni" + description
- Right: illustrative graphic of someone browsing listings

**Expert Alumni Showcase Section**
- Section title: "Featured Alumni Mentors"
- A 3-column (desktop), 2-column (tablet), 1-column (mobile) grid of Alumni Profile Cards
- Each card shows: avatar, colored role badge ("Alumni"), name, industry, skills tags, number of mentorships, star rating display
- "See More" button below the grid linking to `/alumni`
- Cards have soft shadow, rounded corners, white background — matching the card grid in the reference image

**Testimonials Section**
- Dark background section with a quote carousel/slider
- Each slide: quote text, alumni name, star rating
- Navigation arrows on both sides

**Bottom CTA Banner**
- Illustration on the left
- Heading: "Ready to grow your career?" + description
- "Get Started" button
- Soft background color differentiated from the rest of the page

### Static About Page (`/about`)
- Simple page with platform mission, team description placeholder, and a contact email

## ✅ Phase 3 Completion Criteria
- Landing page has all 6 sections built and styled
- Navigation correctly switches between guest and authenticated states
- All CTA buttons navigate to the correct routes
- The page is fully responsive across mobile, tablet, and desktop
- Alumni showcase cards on the landing page load real data from `GET /api/users` (filtered to Alumni role, limited to 6)
- Design closely matches the card-grid, hero, and testimonial layout from the reference image

---

---

# ⚡ PHASE 4 — Alumni Discovery & Browse Directory

## 📌 Context Block
> **Phases 1, 2, and 3 are complete.** The project now has:
> - Authentication system with JWT and role protection
> - User profile editor and public profile view
> - Full landing page with navigation bar
> - Alumni cards on the landing page pulling real data from the backend
>
> Read `reference.md` — especially the Alumni Discovery Module, the Users API routes, and the Page Inventory — before building this phase.

## 🎯 Goal
Build a fully functional, filterable, and searchable Alumni Directory page where students (and guests) can discover alumni by industry, skills, and name.

## 📋 What to Build

### Backend
- Update `GET /api/users` route to:
  - Return only users with the `Alumni` role by default
  - Support query parameters for filtering: `industry`, `skills` (comma-separated), `search` (matches name or bio)
  - Return paginated results with a `page` and `limit` query param
  - Exclude sensitive fields (password) from the response

### Frontend — Alumni Directory Page (`/alumni`)
- **Search Bar** at the top: a prominent text input that searches alumni by name or keyword in real-time (debounced API call)
- **Filter Sidebar or Filter Bar:**
  - Industry filter: dropdown or a set of filter chips (Software, Finance, Healthcare, Marketing, Data Science, etc.)
  - Skills filter: multi-select tag input
  - Clear filters button
- **Alumni Card Grid:**
  - Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
  - Each card displays: avatar, name, Alumni role badge (purple per `reference.md` tokens), industry, current company, top 3 skill tags, a "View Profile" button
  - Card hover state: slight lift effect (box shadow increase) and teal border accent
  - Cards are clickable and navigate to `/alumni/:id`
- **Pagination** or "Load More" button at the bottom of the grid
- **Empty State:** an illustration and message when no alumni match the current filters
- **Loading State:** Chakra UI Skeleton cards while data is fetching

### Student Dashboard Update
- Add a "Browse Alumni" quick-action card on the student dashboard that links to `/alumni` with a count of total alumni on the platform

## ✅ Phase 4 Completion Criteria
- The alumni directory loads real data from MongoDB
- Search filters results correctly (by name, industry, skills)
- Filters can be combined and cleared
- Pagination works — navigating to page 2 shows the next batch
- Clicking a card navigates to the correct alumni profile page built in Phase 2
- Loading and empty states are handled gracefully

---

---

# ⚡ PHASE 5 — Mentorship Request System

## 📌 Context Block
> **Phases 1–4 are complete.** The project now has:
> - Full auth system with protected routes and role guards
> - User profile creation and public profile views
> - Landing page and navigation
> - Alumni directory with search and filters
> - Clicking an alumni card opens their full profile
>
> Read `reference.md` — especially the Mentorship Request Module, the MentorshipRequests data model, and the Mentorship API routes — before building this phase.

## 🎯 Goal
Build the complete mentorship request lifecycle: a Student sends a request to an Alumni, the Alumni manages (accepts/rejects) incoming requests, and both parties can track the status of all their mentorship connections.

## 📋 What to Build

### Backend
- Create the `MentorshipRequest` model/schema from the Data Models section of `reference.md`
- Build Mentorship API routes as defined in the API Route Map in `reference.md`:
  - `POST /api/mentorship` — Student only; creates a new request to an alumni; prevent duplicate pending requests to the same alumni
  - `GET /api/mentorship/sent` — Student only; returns all requests the student has sent with status
  - `GET /api/mentorship/received` — Alumni only; returns all incoming requests to the alumni
  - `PUT /api/mentorship/:id` — Alumni only; updates a request status to `accepted` or `rejected`
- Validate that a Student cannot send a mentorship request to another Student

### Frontend — Student Side
- **Request Mentorship Flow:**
  - On the Alumni Profile page (`/alumni/:id`), the "Request Mentorship" button opens a Chakra UI Modal
  - The modal contains a textarea for the student to write a personal message to the alumni
  - On submit, call `POST /api/mentorship` and show a success toast; button changes to "Request Sent" (disabled)
  - If a pending/accepted request already exists, show status indicator on the button instead
- **My Mentorships Page (`/mentorship`)** — Student view:
  - A list/card view of all mentorship requests the student has sent
  - Each card shows: alumni avatar + name, request message excerpt, current status badge (Pending = yellow, Accepted = green, Rejected = red — use Chakra UI Badge)
  - Clicking an accepted mentorship card shows a "Send Message" button (links to `/messages` — wired in Phase 6)
  - Filter tabs: All / Pending / Accepted / Rejected

### Frontend — Alumni Side
- **Mentorship Requests Page (`/mentorship/requests`)** — Alumni view:
  - Incoming request cards showing: student avatar + name, their skills/industry, their message
  - Two action buttons per card: "Accept" (teal) and "Decline" (red outline)
  - On action, update status via `PUT /api/mentorship/:id` and update card UI immediately (optimistic update)
  - Filter tabs: Pending / Accepted / Rejected
- **Alumni Dashboard Update:**
  - Add a summary card showing count of pending mentorship requests with a direct link to the requests page

## ✅ Phase 5 Completion Criteria
- A student can send a mentorship request from an alumni's profile page with a message
- Duplicate requests to the same alumni are prevented
- Alumni can view all incoming requests and accept or reject them
- Status changes reflect immediately in the UI without a full page reload
- The student's mentorship list shows real-time status for each request
- Status badges are color-coded correctly (Pending/Accepted/Rejected)

---

---

# ⚡ PHASE 6 — Messaging / Communication System

## 📌 Context Block
> **Phases 1–5 are complete.** The project now has:
> - Authentication, profiles, alumni discovery, and landing page
> - A full mentorship request lifecycle (send → accept/reject → track status)
> - Accepted mentorships create a connection between Student and Alumni
>
> Read `reference.md` — especially the Messaging Module, the Messages data model, and the Messages API routes — before building this phase.
> Messaging should only be available between users who share an **accepted** mentorship relationship.

## 🎯 Goal
Build an in-platform messaging system with a conversation list and a real-time-style chat window interface, accessible to both Students and Alumni who have an accepted mentorship connection.

## 📋 What to Build

### Backend
- Create the `Message` model/schema from the Data Models section of `reference.md`
- Build Messaging API routes from the API Route Map in `reference.md`:
  - `GET /api/messages/:userId` — returns all messages exchanged between the logged-in user and the specified `userId`, ordered chronologically
  - `POST /api/messages` — sends a new message from the logged-in user to a recipient; validate that an accepted mentorship exists between the two users before allowing the message
- Create `GET /api/messages/conversations` — returns a list of all unique users the logged-in user has exchanged messages with, including the latest message preview and timestamp, for populating the conversation sidebar

### Frontend — Messaging Page (`/messages`)
Build a two-panel messaging interface styled similarly to a modern chat application:

**Left Panel — Conversation List**
- Lists all users the logged-in user has an accepted mentorship with
- Each item: avatar, name, role badge, last message preview (truncated), timestamp
- Clicking an item opens that conversation in the right panel
- Highlight the active conversation
- Search/filter input at the top of the conversation list

**Right Panel — Chat Window**
- Header: avatar + name + role of the person being chatted with, with a "View Profile" link
- Message bubbles: sent messages aligned right (teal background), received messages aligned left (gray background) — consistent with modern chat UI conventions
- Each bubble shows the message content and timestamp
- Input bar at the bottom: textarea + "Send" button (teal)
- On send, `POST /api/messages` is called and the new message appends immediately to the chat window
- Auto-scroll to the latest message when the chat window opens or a new message is sent
- **Polling:** set up a polling interval (every 5 seconds) to fetch new messages and update the chat window without requiring a page reload (simulates real-time behavior; note: WebSockets are an optional advanced feature per `reference.md`)

**Empty State:**
- If the user has no accepted mentorships yet, show an illustration and a message: "No conversations yet. Get started by connecting with an alumni mentor." with a link to `/alumni`

**Access guard:**
- If a user navigates to `/messages` without any accepted mentorships, show the empty state above

### Navigation Update
- Add a Messages icon/link to the top navigation bar for authenticated users
- Show a notification dot/badge if there are unread messages (based on whether the latest message timestamp is newer than the last time the user visited the messages page)

## ✅ Phase 6 Completion Criteria
- The conversation list populates with real accepted-mentorship connections
- Messages are sent and received correctly and stored in MongoDB
- Chat history loads in chronological order
- New messages appear in the UI without a page refresh (via polling)
- Sending a message without an accepted mentorship is blocked on the backend
- The UI is responsive — on mobile, conversation list and chat window toggle between views

---

---

# ⚡ PHASE 7 — Opportunity Sharing Board

## 📌 Context Block
> **Phases 1–6 are complete.** The project now has:
> - Auth, profiles, alumni discovery, landing page
> - Full mentorship request and acceptance lifecycle
> - In-platform messaging between connected users
>
> Read `reference.md` — especially the Opportunity Sharing Module, the Opportunities data model, and the Opportunities API routes — before building this phase.

## 🎯 Goal
Build the job and internship opportunities board — Alumni can post opportunities, Students can browse and view them.

## 📋 What to Build

### Backend
- Create the `Opportunity` model/schema from the Data Models section of `reference.md`
- Build Opportunity API routes from the API Route Map in `reference.md`:
  - `GET /api/opportunities` — public; returns all opportunities sorted by newest first; support `type` query param (`job` or `internship`) and `search` query param (matches title, company, or description)
  - `POST /api/opportunities` — Alumni only; creates a new opportunity; `postedBy` is set automatically from the authenticated user
  - `DELETE /api/opportunities/:id` — Alumni only; allows an alumni to delete only their own postings; Admin can delete any

### Frontend — Opportunities Browse Page (`/opportunities`) — Students and Guests
- **Filter/Search Bar** at the top:
  - Text search (title, company)
  - Type filter: toggle between "All", "Jobs", "Internships" (use Chakra UI Button Group or Tabs)
- **Opportunity Card Grid:**
  - Responsive grid layout
  - Each card: company name (bold), opportunity title, type badge (Job = teal, Internship = pink), short description, posted by (alumni avatar + name linkable to their profile), posted date
  - Cards have hover effect consistent with the alumni directory cards
- **Empty/Loading States** handled with Chakra UI Skeletons and an illustration

### Frontend — Alumni Opportunity Management (`/opportunities/manage`)
- **Post New Opportunity Form** (Chakra UI form):
  - Fields: title, company, type (Job / Internship radio), description (textarea)
  - Submit button — calls `POST /api/opportunities` and resets the form on success with a toast
- **My Posted Opportunities List:**
  - Shows all opportunities the logged-in alumni has posted
  - Each item has a "Delete" button (with a confirmation dialog using Chakra UI AlertDialog)
  - Empty state if none posted yet

### Dashboard Updates
- **Student Dashboard:** Add an "Opportunities" summary card showing count of latest opportunities with a link to `/opportunities`
- **Alumni Dashboard:** Add a "My Postings" summary card with a count and link to `/opportunities/manage`
- **Landing Page:** Update the Opportunities CTA section to show the real count of available opportunities from the API

## ✅ Phase 7 Completion Criteria
- Alumni can post, view, and delete their own opportunities
- Students can browse all opportunities with working search and type filters
- Posted-by shows the alumni's name and links to their profile
- Deleting requires confirmation and updates the list immediately
- All loading and empty states are handled

---

---

# ⚡ PHASE 8 — Admin Dashboard

## 📌 Context Block
> **Phases 1–7 are complete.** The full platform is functional for Students and Alumni:
> - Auth, profiles, alumni directory, landing page
> - Mentorship requests with accept/reject lifecycle
> - In-platform messaging
> - Job and internship opportunity board
>
> Read `reference.md` — especially the Admin role definition, Admin Pages in the Page Inventory, and Admin API routes — before building this phase.
> Admin users are created manually in the database (no admin self-registration).

## 🎯 Goal
Build the Admin dashboard for platform oversight — viewing all users, managing accounts, and seeing platform-wide analytics.

## 📋 What to Build

### Backend
- Apply Admin role guard to all admin routes using the role middleware from Phase 1
- Build Admin API routes from the API Route Map in `reference.md`:
  - `GET /api/admin/users` — returns all users (all roles) with full profile data (excluding passwords); support pagination and a `role` filter query param
  - `DELETE /api/admin/users/:id` — hard-deletes a user; cascade: also delete their mentorship requests, messages sent/received, and opportunities posted
- Add `GET /api/admin/stats` — returns platform-wide counts: total users, total students, total alumni, total mentorship requests, total accepted mentorships, total opportunities

### Frontend — Admin Dashboard (`/admin/dashboard`)
- **Stats Overview Row:**
  - A row of stat cards (Chakra UI `Stat` component): Total Users, Active Alumni, Active Students, Mentorship Requests, Accepted Mentorships, Opportunities Posted
  - Each card has an icon, number, and label
  - Fetch from `GET /api/admin/stats`

### Frontend — Admin User Management (`/admin/users`)
- **User Table:**
  - Chakra UI Table with columns: Avatar, Name, Email, Role (badge), Joined Date, Actions
  - Role filter tabs at top: All / Students / Alumni
  - Search input filtering by name or email
  - Pagination
- **Actions per row:**
  - "View Profile" — opens the user's public profile in a new tab
  - "Delete" — opens a Chakra UI AlertDialog for confirmation, then calls `DELETE /api/admin/users/:id` and removes the row from the table
- Highlight Admin accounts with a distinct row background so they cannot be accidentally deleted (disable delete action for admin-role rows)

### Frontend — Navigation Guard for Admin
- Admin users should be redirected to `/admin/dashboard` after login (not the standard `/dashboard`)
- The persistent nav bar should show an "Admin Panel" link only for Admin-role users

## ✅ Phase 8 Completion Criteria
- Admin can log in and land on the admin dashboard
- Stats cards display accurate real-time counts from the database
- Admin can browse all users with working filters and pagination
- Deleting a user removes them and their associated data from MongoDB
- Admin accounts are protected from deletion in the UI
- Non-admin users cannot access any `/admin/*` routes (backend and frontend guards)

---

---

# ⚡ PHASE 9 — Polish, Animations & Responsive Design

## 📌 Context Block
> **Phases 1–8 are complete.** The entire AlumniConnect platform is fully functional:
> - Auth + roles, profiles, alumni directory, mentorship system, messaging, opportunities board, admin panel
> - All backend API routes are working and all frontend pages are built
>
> Read `reference.md` — especially the UI/Design Vision, Chakra UI Theme Tokens, and the Non-Negotiable Implementation Rules — before building this phase.
> This is the final phase focused entirely on quality, polish, performance, and design consistency.

## 🎯 Goal
Elevate the platform from functional to exceptional — apply consistent design polish, add meaningful animations and micro-interactions, ensure full responsiveness on all screen sizes, and handle all edge cases in the UX.

## 📋 What to Build

### Design Consistency Audit
- Audit every page against the `reference.md` design vision and fix any inconsistencies in: spacing, card shadow levels, border radius values, badge colors, heading sizes, and button styles
- Ensure the Chakra UI theme tokens (teal primary, pink/purple accents, card shadows, heading font) are consistently applied platform-wide
- Replace any plain/unstyled placeholder sections remaining from earlier phases

### Animations & Micro-Interactions
- **Landing Page:** Add staggered fade-in animation for the hero section on page load (heading → subtext → CTA button → illustration, each with a slight delay)
- **Alumni Cards (Directory & Landing):** Add a smooth scale + shadow transition on hover
- **Mentorship Status Badge changes:** Animate the badge color transition when a request is accepted/rejected
- **Page Transitions:** Add a subtle fade-in animation when navigating between pages using React Router
- **Button Loading States:** All submit buttons must show a Chakra UI `Spinner` while the API call is in progress and be disabled to prevent double submission
- **Skeleton Loaders:** Ensure every data-fetching screen (alumni directory, opportunities board, messages, dashboard stats) has a Skeleton loading state matching the shape of the content

### Responsive Design Pass
- Test and fix all pages on mobile (375px), tablet (768px), and desktop (1280px) viewports
- Navigation: ensure the mobile hamburger menu opens a Chakra UI Drawer with all nav links
- Alumni directory: cards collapse to single-column on mobile
- Messaging page: on mobile, show only the conversation list; tapping a conversation shows only the chat window (toggle between panels with a back button)
- Admin user table: on mobile, collapse to a stacked card view instead of a horizontal table
- All modals (request mentorship, delete confirmation) should be full-screen on mobile

### Error & Edge Case Handling
- **Network errors:** Any failed API call should show a Chakra UI toast with a user-friendly message (not a raw error string)
- **Empty states:** Verify every list/grid page has a polished empty state with an illustration and helpful message
- **404 Page:** Build a custom 404 page with the platform's styling and a "Go Home" button
- **Session expiry:** If the JWT expires and a protected API call returns 401, automatically log the user out, clear localStorage, and redirect to `/login` with a toast saying "Session expired, please log in again" — implement this in the global Axios response interceptor

### Performance
- Lazy load all route components using React's `React.lazy` and `Suspense` with a fallback spinner
- Debounce all search inputs (alumni directory, opportunity search, admin user search) to avoid excessive API calls

### Final Walkthrough Checklist
Before declaring the project complete, verify:
- [ ] All 3 roles (Student, Alumni, Admin) can complete their full user journey end-to-end
- [ ] No hardcoded data anywhere in the frontend or backend
- [ ] All environment variables documented in a `.env.example` file
- [ ] All forms have validation and show inline error messages
- [ ] The platform logo/name appears consistently in the nav and browser tab title
- [ ] Toast notifications appear for all major user actions (success and error)
- [ ] The landing page loads real alumni data from the database
- [ ] Mobile navigation is fully functional

## ✅ Phase 9 Completion Criteria
- Every page has consistent styling with no visual regressions from earlier phases
- Page transitions, card hovers, and button loading states are smooth and feel polished
- All pages are fully responsive across mobile, tablet, and desktop
- Session expiry is handled gracefully with auto-logout
- Route-level code splitting is implemented
- The platform passes the final walkthrough checklist above

---

*End of AlumniConnect Phased Build Prompts — 9 Phases Total*
