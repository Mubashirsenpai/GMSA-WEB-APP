# GMSA UDS NYC – Web Application Plan

## Overview
Web application for **Ghana Muslim Students' Association (GMSA)** at University for Development Studies, Nyankpala Campus. Goals: communication, information dissemination, alumni contact, filtered messaging, and showcasing association activities.

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | PostgreSQL + Prisma ORM |
| Media | Cloudinary |
| SMS | External SMS API (e.g. Hubtel, mNotify, Africa's Talking) |
| Auth | JWT + role-based access |

---

## User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **Admin** | Full access: manage users, roles, all content, settings, bulk SMS, donations |
| **PRO** | Gallery upload, announcements, events, timetables, Khutbah/learning materials |
| **Secretary** | Member/madrasa/alumni/event registration approvals |
| **Member** | View content, register for events/madrasa, blog interaction, profile |
| **Visitor** | Public content, suggestion box, donate, view executive/gallery/announcements |

---

## Database Entities (Prisma)

- **User** – id, email, passwordHash, name, phone, gender, level, role, isAlumni, isExecutive, position, avatarUrl, createdAt, etc.
- **Executive** – id, userId, position, order, tenureStart, tenureEnd
- **Announcement** – id, title, body, authorId, publishedAt, priority
- **Event** – id, title, description, venue, startAt, endAt, imageUrl, registrationRequired, maxAttendees
- **EventRegistration** – id, eventId, userId, status (pending/approved/rejected)
- **Member** – id, userId, status (pending/approved), approvedById, approvedAt
- **MadrasaRegistration** – id, userId, sessionId, status
- **MadrasaSession** – id, title, dayOfWeek, time, description
- **Alumni** – id, userId, yearCompleted, occupation, approvedById
- **Gallery** – id, title, imageUrl, albumId, uploadedById, createdAt
- **GalleryAlbum** – id, name, coverImageUrl, createdAt
- **PrayerTimetable** – id, title, fileUrl, periodStart, periodEnd, uploadedById
- **KhutbahMaterial** – id, title, description, fileUrl, date, uploadedById
- **LearningMaterial** – id, title, description, fileUrl, category, uploadedById
- **BlogPost** – id, title, slug, body, authorId, coverImageUrl, publishedAt
- **BlogLike** – id, postId, userId
- **BlogComment** – id, postId, userId, body, createdAt
- **BlogReshare** – id, postId, userId, createdAt
- **Suggestion** – id, name, email, message, isPublic, createdAt
- **Donation** – id, userId (optional), amount, projectType (weekly_project / masjid_renovation), reference, status, createdAt
- **SmsLog** – id, recipientGroup, recipientCount, message, sentById, sentAt

---

## API Structure (Express)

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`
- **Users**: `/api/users` (CRUD, role assignment – Admin)
- **Executives**: `/api/executives` (list, create, update – Admin/PRO)
- **Announcements**: `/api/announcements` (CRUD – PRO, list public)
- **Events**: `/api/events` (CRUD – PRO), `/api/events/:id/register` (member)
- **Registrations**: `/api/registrations/members`, `/api/registrations/madrasa`, `/api/registrations/alumni`, `/api/registrations/events` (approve – Secretary)
- **Gallery**: `/api/gallery/albums`, `/api/gallery/albums/:id/images` (upload – PRO)
- **Downloads**: `/api/timetables`, `/api/khutbah`, `/api/learning-materials` (upload PRO, list public)
- **Blogs**: `/api/blogs` (CRUD – PRO/Admin), `/api/blogs/:id/like`, `comment`, `reshare`
- **Suggestions**: `/api/suggestions` (create public, list – Admin)
- **Donations**: `/api/donations` (create, list – Admin)
- **SMS**: `/api/sms/send-bulk` (Admin, filter by role/level/gender/alumni etc.)

---

## Frontend Structure (Next.js)

- **Public**: Home, Executive Board, Announcements, Events (list + detail), Gallery, Downloads (timetables, Khutbah, learning), Donate, Suggestion Box, Blog (list + post)
- **Auth**: Login, Register (member request)
- **Dashboard** (role-based):
  - Admin: Users, roles, suggestions, donations, SMS, settings
  - PRO: Manage announcements, events, gallery, timetables, Khutbah, learning materials, blogs
  - Secretary: Pending member/madrasa/alumni/event approvals
  - Member: My registrations, profile, event signup, madrasa signup, alumni registration
- **Theme**: Primary green and white (GMSA branding)

---

## External Integrations

1. **Cloudinary**: Upload images/documents for gallery, events, blogs, timetables, Khutbah, learning materials.
2. **SMS API**: Server-side endpoint to send bulk SMS; filters (executives, level, gender, alumni, general) map to DB queries, then trigger SMS gateway.

---

## Project Folder Structure

```
GMSA WEP APP/
├── client/                 # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── ...
├── PLAN.md
└── README.md
```

---

## Implementation Order

1. Initialize client (Next.js) and server (Express + Prisma), DB schema.
2. Auth (register, login, JWT, roles).
3. Executive board, announcements, events (CRUD + public list).
4. Registrations (member, event, madrasa, alumni) + Secretary approval.
5. Gallery (albums + upload via Cloudinary).
6. Downloads (timetables, Khutbah, learning materials).
7. Blogs with like, comment, reshare.
8. Suggestion box and donations (GHS 2.00 project, Masjid renovation).
9. Admin: user/role management, SMS bulk send with filters.
10. Polish UI (green/white), responsive layout, README and env example.

---

Next step: create the repository structure and implement steps 1–2 (project setup + auth).
