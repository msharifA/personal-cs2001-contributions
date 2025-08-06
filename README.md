# ♻️ ReUseMe: Personal Contributions to a Circular Marketplace Web App  
**Author**: Mohamed Sharif Ali (2376659)  
**Course**: CS2001 Software Development, Brunel University London  
**Academic Year**: 2024–25  
**Group**: 10

---

## 🔍 Overview

This repository presents my **personal contributions** to *ReUseMe*, a group-based coursework project designed to address **UN SDG 12: Responsible Consumption and Production**. The platform enables community reuse and donation of items, promoting sustainable consumption through a geolocation-enabled marketplace.

This public version only includes code and features I directly developed or managed during the group project, and it complies with the university’s academic integrity policies.

---

## 💻 My Key Contributions

### 🧱 1. Book Management System (Frontend + Backend)

> _“From user input to database storage and back again.”_

I designed and implemented the **end-to-end flow** of a dedicated book listing system:

- **Frontend**
  - `BookForm.jsx` with real-time validation (title, author, ISBN, location)
  - State-managed forms with debounced geolocation API calls
  - Secure POST requests with JWT authentication
- **Backend**
  - REST controller (`BookController.java`)
  - Business logic (`BookService.java`)
  - Persistence layer with JPA (`BookRepository.java`)
  - Entity modeling and validation (`Book.java`, `@Valid`, etc.)

⏯️ [Demo video of the Book system](https://youtu.be/MFwDpmPM-l0?feature=shared)

---

### 🗓️ 2. Collection Scheduling & In-App Messaging Integration

> _“From an email-based prototype to a scalable, real-time scheduler.”_

I explored and evaluated multiple scheduling designs before implementing the **in-app pickup scheduling system**:

- Built `ScheduleCollection.jsx` component for users to arrange pickups
- Replaced complex email notifications with real-time messaging
- Developed backend endpoints (`CollectionController`, `CollectionService`)
- Integrated scheduling messages into the existing chat system via `MessageService` made by team member Carlos
- Added timezone-safe validation and real-time confirmations

🛠️ Rejected: JavaMail email confirmation system  
✅ Chosen: In-app real-time scheduling flow using Spring + React

---

### 🧰 3. Dashboard Item Management (Final Sprint Rescue)

When a team member exited, I took over and delivered the critical **Edit/Delete** functionality for user-listed items:

- `EditItemForm.jsx` modal for inline editing with pre-filled data
- Confirm-before-delete UI flow
- Backend security checks to ensure proper item ownership
- Secure REST integration for updates and deletions

---

## 🧠 Technical Architecture

My features followed a layered, decoupled architecture:
Frontend UI (React)
└─ BookForm, ScheduleCollection
└─ Validation + JWT-secured fetch
└─ Spring Controller
└─ Service Layer (Business Logic)
└─ Repository (JPA)
└─ MySQL

Frontend UI (React)
└─ BookForm, ScheduleCollection
└─ Validation + JWT-secured fetch
└─ Spring Controller
└─ Service Layer (Business Logic)
└─ Repository (JPA)
└─ MySQL

personal-cs2001-contributions/
├── src/
│ ├── BookForm.jsx
│ ├── ScheduleCollection.jsx
│ ├── EditItemForm.jsx
│ └── components/
│ └── ItemCard.jsx
├── backend/
│ ├── controller/
│ │ └── BookController.java
│ ├── service/
│ │ └── BookService.java
│ ├── model/
│ │ └── Book.java
│ ├── repository/
│ │ └── BookRepository.java
│ └── CollectionController.java
├── public/
│ └── README.md
