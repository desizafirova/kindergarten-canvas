---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-02-01
author: Desi
---

# Product Brief: kindergarten-canvas

## Executive Summary

Kindergarten-canvas is a custom content management solution built specifically for local Bulgarian kindergartens. The system addresses the critical gap between having a modern web presence and the ability to maintain it independently. By providing a Bulgarian-language admin panel with an intuitive, "fool-proof" interface, the platform empowers non-technical kindergarten directors to manage dynamic content (news, job postings, admission deadlines, events, galleries, staff profiles) without developer intervention. Built with React, Node.js, and PostgreSQL, the solution delivers exactly what kindergartens need—a streamlined, cost-effective alternative to complex CMS platforms that are either too overwhelming or don't support Bulgarian workflows. This project also serves as a portfolio piece demonstrating AI-assisted full-stack development capabilities.

---

## Core Vision

### Problem Statement

Local kindergarten administrators face a content management paradox: they have modern websites but lack the ability to update them independently. With static, hardcoded content, directors must either wait for developer availability to post urgent updates (admission deadlines, emergency announcements, job openings) or resort to fragmented communication channels like phone calls and messaging apps. This creates delays, inconsistent information distribution, and frustration for staff who lack control over their own digital presence. For a kindergarten needing 5-10+ content updates annually, this dependency on technical resources is both inefficient and unsustainable.

### Problem Impact

**For Kindergarten Directors:**
- Loss of autonomy over their institution's public communications
- Inability to make timely announcements when they matter most
- Dependency on developer availability for routine updates
- Fragmented communication forcing manual outreach to parents

**For Parents:**
- Inconsistent access to important information (deadlines, events, news)
- Reliance on word-of-mouth rather than centralized, official sources
- Potential to miss critical updates about admissions, schedules, or emergencies

**For Developers:**
- Ongoing maintenance burden for simple content updates
- Interruptions for non-technical change requests
- Difficulty scaling support across multiple clients

### Why Existing Solutions Fall Short

**WordPress and Traditional CMS Platforms:**
- Overwhelming complexity for users who need 5-6 content types, not dozens of plugins
- Bulgarian language support often requires additional plugins or themes
- Hosting costs and maintenance overhead for small institutions
- Security vulnerabilities requiring constant updates
- Steeper learning curve than necessary for basic content management

**Off-the-Shelf Website Builders (Wix, Squarespace):**
- Monthly subscription costs add up
- Limited customization for existing React frontend
- Generic templates don't match the specific, already-built design
- Migration complexity from current codebase

**Social Media (Facebook Pages):**
- Not all parents use Facebook consistently
- Lacks professional credibility for official institutional information
- No structured organization for different content types (jobs vs. news vs. deadlines)
- Poor long-term information retention and searchability

**The Core Gap:** Existing solutions are either too complex, too expensive, incompatible with the current frontend, or lack the simplicity needed for non-technical Bulgarian-speaking administrators.

### Proposed Solution

Kindergarten-canvas backend is a purpose-built content management API and admin panel designed specifically for Bulgarian kindergarten workflows. The system consists of three core components:

**1. RESTful API Layer (Node.js/Express + PostgreSQL)**
- Secure endpoints for managing news, jobs, admission deadlines, events, gallery images, and staff profiles
- JWT-based authentication for admin access
- Structured data models optimized for kindergarten content types
- Integration with existing React frontend via clean API contracts

**2. Bulgarian-Language Admin Panel (/admin)**
- Fully localized interface (buttons, labels, instructions, error messages in Bulgarian)
- Role-based authentication (director/admin access)
- Intuitive content management dashboard with:
  - Simple forms with clear field labels
  - WYSIWYG editor for rich text content (announcements, news)
  - Drag-and-drop image uploads for galleries and staff photos
  - Date pickers for admission deadlines and event scheduling
  - Preview functionality before publishing

**3. Content Architecture**
- **Dynamic (Admin-Controlled):** News/announcements, job postings, admission deadlines, event calendar, photo gallery, teachers/staff profiles
- **Static (Hardcoded):** About section, programs description, contact information, site structure/navigation

**Technology Stack:**
- **Frontend:** React (matching existing site stack)
- **Backend:** Node.js with Express framework
- **Database:** PostgreSQL with Prisma ORM (type-safe, structured data)
- **Authentication:** JWT tokens + bcrypt password hashing
- **File Storage:** Cloudinary or AWS S3 for image uploads
- **Deployment:** TBD based on infrastructure preferences

**User Experience Flow:**
1. Director navigates to `/admin`
2. Logs in with credentials (Bulgarian login page)
3. Sees dashboard with clear sections: Новини (News), Кариери (Careers), Галерия (Gallery), etc.
4. Clicks "Добави новина" (Add News), fills simple form, uploads image if needed
5. Previews content, clicks "Публикувай" (Publish)
6. Content immediately appears on public website via API integration

### Key Differentiators

**1. Precision-Fit Solution**
Unlike bloated CMS platforms, kindergarten-canvas delivers exactly what kindergartens need—no more, no less. Six content types, Bulgarian interface, fool-proof UX. This focused approach reduces cognitive load and training time to near zero.

**2. True Bulgarian Localization**
Not just translated content, but an interface designed for Bulgarian-speaking, non-technical users from the ground up. Every button, label, error message, and instruction written in natural Bulgarian language.

**3. "Fool-Proof" User Experience**
Designed for basic-to-intermediate tech literacy with:
- Visual feedback at every step
- Clear error prevention (required fields, format validation)
- Drag-and-drop interactions (no file path hunting)
- WYSIWYG editing (what you see is what parents will see)
- Minimal technical jargon

**4. Cost-Effective & Performant**
- No monthly CMS subscription fees
- Lightweight, fast-loading admin panel
- Optimized for small-scale content management (not enterprise bloat)
- Lower hosting costs than WordPress with comparable functionality

**5. AI-Assisted Development Showcase**
This project demonstrates modern AI-assisted full-stack development practices:
- Thoughtful architecture planning with AI collaboration
- Clean API design and type-safe database modeling
- User-centered design for non-technical audiences
- Full-stack JavaScript/TypeScript proficiency

**6. Scalability Potential**
While built as a one-off solution, the architecture is replicable for other kindergartens or similar small institutions needing simple, Bulgarian-language content management without CMS complexity.

---

## Target Users

### Primary Users

**Администратор (Kindergarten Administrator)**

**Profile:**
- Age: 40-50 years old
- Role: Kindergarten director/administrator responsible for all website content management
- Technical Proficiency: Basic to intermediate - comfortable with web browsing, social media, and basic Microsoft Office tools
- Language: Bulgarian (requires fully Bulgarian-language interface)

**Current Pain Points:**
- Must manually call parents individually to communicate urgent updates (admission deadlines, news, announcements)
- No control over website content - completely dependent on developer availability
- Frustrated when time-sensitive information needs to be published but can't access the website
- Has witnessed parents missing important deadlines and news due to fragmented communication

**Needs & Goals:**
- Update website content independently on a weekly basis
- Simple, "fool-proof" interface that doesn't require technical training
- Full control over kindergarten's digital communication
- Manage all content: news, job postings, admission deadlines, events, photo galleries, and teacher profiles (including photos, positions, names, short bios)

**Success Criteria:**
Administrator feels "in control" when they can log in to a Bulgarian-language admin panel, add/edit content using simple forms and visual editors, upload photos with drag-and-drop, and see updates immediately appear on the public website—all without calling the developer.

**Responsibilities:**
- Create and manage all dynamic content
- Upload and manage teacher information (photos, bios, positions)
- Monitor job applications received via email from website form
- Maintain accuracy and timeliness of all public-facing information

### Secondary Users

**Parents (Content Consumers)**

**Profile:**
- Primary audience for website content
- Access information about kindergarten news, events, admission deadlines, and staff

**Current Pain Points:**
- Inconsistent access to important updates
- Reliance on phone calls or word-of-mouth for kindergarten news
- Risk of missing critical deadlines

**Needs:**
- Easy access to up-to-date kindergarten information
- Clear visibility of admission deadlines and important dates
- Single source of truth for official information

**Job Applicants**

**Profile:**
- Individuals seeking employment at the kindergarten
- Apply via online form or email

**Needs:**
- View current job openings with clear descriptions
- Apply via simple contact form (sends email to kindergarten)

**Developer/Maintainer**

**Profile:**
- Full-stack developer (Desi) building and maintaining the system
- Admin-level access for testing and maintenance

**Needs:**
- Clean, maintainable codebase
- Testing environment access
- Portfolio showcase piece

### User Journey

**Administrator's Weekly Content Update Flow:**

1. **Login** → Navigate to `/admin`, see Bulgarian login, enter credentials
2. **Dashboard** → See clearly labeled Bulgarian sections (Новини, Кариери, Галерия, Учители, Събития, Срокове)
3. **Add Content** → Click "Добави новина" (Add News), fill simple form, drag-and-drop image, use WYSIWYG editor
4. **Preview & Publish** → Click "Преглед" to preview, then "Публикувай" to publish
5. **Verification** → Open public website, see content live immediately
6. **"Aha!" Moment** → "I just published this myself - no developer needed!"

**Parent's Journey:**

1. Visit website to check latest news and deadlines
2. Browse events, teacher profiles, admission information
3. Bookmark site as reliable, up-to-date source
4. Take action on deadlines and events

**Job Applicant Journey:**

1. Navigate to Careers page
2. Read job description
3. Fill application form (name, email, phone, resume, cover letter)
4. Submit → Form sends email to kindergarten
5. Receive confirmation message

---

## Success Metrics

### User Success Indicators

**Administrator Independence:**
- **100% Self-Sufficiency:** Administrator can publish, edit, and manage all content types independently after initial training, with zero developer calls/messages for routine content updates
- **Publishing Efficiency:** Time from login to live content update: **maximum 15 minutes** for standard content (news, events, job postings)
- **Technical Reliability:** No technical errors or bugs blocking content management workflow
- **User Confidence:** Administrator feels comfortable publishing content without fear of breaking the website or needing technical assistance
- **Content Control:** Administrator can update any content type (news, jobs, deadlines, events, gallery, staff profiles) whenever needed, on their own schedule

**Parent Experience:**
- Parents have access to up-to-date, accurate kindergarten information via centralized website
- Reduction in missed deadlines and important announcements due to timely website updates
- Website becomes the single source of truth for official kindergarten information

### Business Objectives

**Technical Completeness:**
- All 6 content types fully functional: News/announcements, job postings, admission deadlines, event calendar, photo gallery, teacher/staff profiles
- Secure authentication system (JWT-based) protecting admin access
- Zero critical bugs in production environment
- API performance: Fast response times for content retrieval and updates

**Portfolio & Development Goals:**
- **AI-Assisted Development Showcase:** Demonstrate capability to build full-stack backend systems using AI tools effectively
- **Clean Codebase:** Well-documented, maintainable code with clear architecture demonstrating professional development practices
- **Type-Safe Implementation:** TypeScript/Prisma usage showing modern development standards
- **User-Centered Design:** Bulgarian-language admin interface proving ability to design for non-technical audiences

### Key Performance Indicators

**3-Month Milestones:**
- Backend API and admin panel deployed to production
- Administrator trained on all content management features
- First 5-10 pieces of content published independently by administrator
- All 6 content types tested and validated in production
- Zero critical bugs requiring emergency fixes

**12-Month Success Criteria:**
- Administrator managing all website content independently without developer intervention
- Content updated by administrator on their own schedule (no fixed pattern required)
- System running reliably with minimal maintenance
- Portfolio piece complete: GitHub repo with comprehensive documentation demonstrating AI-assisted full-stack development capabilities

**Continuous Success Indicators:**
- Administrator login frequency: Weekly or as-needed for content updates
- Content freshness: News, events, and deadlines updated regularly by administrator
- Zero content-related support requests to developer
- Job application form functioning: Emails delivered successfully to kindergarten
- System uptime: 99%+ availability for admin panel and public API

---

## MVP Scope

### Core Features

**Backend API:**
- **Authentication System:** JWT-based secure login for administrator access
- **RESTful API Endpoints:** Full CRUD operations for all 6 content types:
  - News/announcements
  - Job postings
  - Admission deadlines
  - Event calendar
  - Photo gallery
  - Teacher/staff profiles
- **Database Schema:** PostgreSQL with Prisma ORM for type-safe data modeling
- **Image Upload & Storage:** Integration with Cloudinary or AWS S3 for photo uploads
- **Email Service:** Automated email notifications to parents when new content is published (news, deadlines, events)
- **Job Application Handling:** Email delivery system for job applications submitted via website form

**Bulgarian-Language Admin Panel:**
- **Authentication:** Login page with secure credential validation
- **Dashboard:** Central hub displaying all content sections with clear Bulgarian labels (Новини, Кариери, Галерия, Учители, Събития, Срокове)
- **Content Management Forms:**
  - Simple, intuitive forms for each content type
  - Clear field labels in Bulgarian
  - Required field validation with user-friendly error messages
  - WYSIWYG editor for rich text content (news, job descriptions, event details)
  - Drag-and-drop image uploader for galleries and staff photos
  - Date pickers for admission deadlines and event scheduling
- **Publishing Workflow:**
  - Preview functionality before publishing
  - Publish/Edit/Delete actions for all content types
  - Immediate content visibility on public website after publishing
- **User Experience:**
  - "Fool-proof" interface requiring no technical training
  - Visual feedback at every step
  - Clear success/error messages in Bulgarian

**Frontend Integration:**
- **API Consumption:** RESTful endpoints that existing React frontend can call to fetch dynamic content
- **Job Application Form:** Contact form on Careers page that collects applicant information and sends emails to kindergarten
- **Email Confirmation:** User feedback confirming successful form submission

**Technical Implementation:**
- **Type Safety:** TypeScript across frontend and backend
- **Documentation:** Clean, well-documented codebase with architectural notes
- **Testing:** Core functionality tested to ensure zero critical bugs
- **Deployment:** Production-ready backend and admin panel

### Out of Scope for MVP

The following features are explicitly deferred to future versions:

**Access & Permissions:**
- Multiple admin roles (teacher role, editor role, etc.) - Single administrator access only
- Role-based permissions or granular access control

**Analytics & Reporting:**
- Page view tracking
- Parent engagement metrics
- Download statistics
- Usage analytics dashboard

**Content Management Enhancements:**
- Content versioning and revision history
- Draft/scheduled publishing (write now, publish later)
- Content rollback or restore functionality
- Bulk content operations

**Communication Features:**
- Parent accounts or login system
- Comments or feedback on news posts
- Two-way messaging between parents and kindergarten
- SMS notifications

**Localization & Internationalization:**
- Multi-language support (English + Bulgarian versions)
- Language switching for content

**Marketing & SEO:**
- Advanced SEO tools (meta descriptions, custom URLs, sitemaps)
- Social media integration (auto-post to Facebook/Instagram)
- Newsletter management system

**Advanced Features:**
- Mobile native app
- Online enrollment or registration system
- Payment processing for kindergarten fees
- Calendar synchronization (Google Calendar, iCal)

### MVP Success Criteria

The MVP will be considered successful when:

**User Adoption:**
- Administrator successfully publishes first 5-10 pieces of content independently
- Zero calls/messages to developer for routine content updates
- Administrator expresses confidence in managing content without technical assistance

**Technical Validation:**
- All 6 content types functioning correctly in production
- Zero critical bugs blocking content management workflow
- Email notifications delivering successfully to parents
- Job application form emails received by kindergarten
- API response times meeting performance expectations

**Problem Validation:**
- Parents accessing up-to-date information via website instead of relying on phone calls
- Reduction in missed deadlines and announcements
- Administrator reports feeling "in control" of kindergarten's digital communication

**Development Goals:**
- Clean, documented codebase demonstrating AI-assisted development
- Type-safe implementation with TypeScript and Prisma
- Portfolio-ready GitHub repository

**Decision Point for Scaling Beyond MVP:**
- If administrator uses system regularly (weekly or as-needed) for 3+ months without developer intervention
- If parents report improved access to timely information
- If system runs reliably with minimal maintenance
- Then consider whether any deferred features would add meaningful value

### Future Vision

This project is designed as a **focused, one-off solution** for a single kindergarten. The long-term vision prioritizes:

**Stability Over Feature Creep:**
- Maintain simplicity and ease-of-use as core values
- Keep the system running reliably with minimal maintenance
- Resist adding complexity that doesn't serve the core use case

**Potential Future Enhancements (only if clearly needed):**
- Email notification preferences for parents (opt-in/opt-out)
- Simple content scheduling if administrator requests it
- Basic analytics if understanding parent engagement becomes important

**No Plans For:**
- Scaling to multiple kindergartens (SaaS model)
- Mobile app development
- Complex parent portals or enrollment systems
- Enterprise-level features

The goal is to demonstrate that **less is more** - a purpose-built solution that solves a specific problem exceptionally well, without the bloat of generic CMS platforms. Success means the administrator manages content confidently and independently, and the system "just works" year after year.
