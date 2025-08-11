# How to Use Supabase Edge Functions

This document provides instructions and examples for calling each of the provisioned Supabase Edge Functions.

**Placeholders:**
- `<PROJECT_REF>`: Your Supabase project reference ID.
- `<SUPABASE_ANON_KEY>`: Your Supabase project's public anonymous key. Used in the `apikey` header or as a Bearer token for anonymous access.
- `<USER_JWT>`: A valid JSON Web Token for an authenticated user. Used in the `Authorization: Bearer` header.

---

## Analytics Service
Tracks custom analytics events.
- **Method:** `POST`
- **Endpoint:** `https://<PROJECT_REF>.supabase.co/functions/v1/analytics-service`
- **Auth:** User JWT
- **Example:**
```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/analytics-service' \
  -H 'Authorization: Bearer <USER_JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"event_name": "app_opened", "payload": {"platform": "web"}}'
```

---

## Booking Service
Performs CRUD operations on bookings.
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`
- **Auth:** User JWT
- **Examples:**
  - **GET all:** `curl .../booking-service -H 'Authorization: Bearer <USER_JWT>'`
  - **POST new:** `curl -X POST .../booking-service -H '...' -d '{"details": "New booking"}'`
  - **PUT update:** `curl -X PUT .../booking-service?id=1 -H '...' -d '{"status": "confirmed"}'`
  - **DELETE:** `curl -X DELETE .../booking-service?id=1 -H 'Authorization: Bearer <USER_JWT>'`

---

## Category Service
Performs CRUD operations on categories.
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`
- **Auth:** User JWT
- **Examples:**
  - **GET all:** `curl .../category-service -H 'Authorization: Bearer <USER_JWT>'`
  - **GET one:** `curl .../category-service?id=1 -H 'Authorization: Bearer <USER_JWT>'`
  - **POST new:** `curl -X POST .../category-service -H '...' -d '{"name": "New Category"}'`

---

## Component Service
Fetches content for dynamic UI components.
- **Method:** `GET`
- **Endpoint:** `.../component-service?key=<component_key>`
- **Auth:** User JWT
- **Example:**
```bash
curl 'https://<PROJECT_REF>.supabase.co/functions/v1/component-service?key=homepage_hero' \
  -H 'Authorization: Bearer <USER_JWT>'
```

---

## Contact Service
Handles public contact form submissions.
- **Method:** `POST`
- **Endpoint:** `.../contact-service`
- **Auth:** Anon Key
- **Example:**
```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/contact-service' \
  -H 'apikey: <SUPABASE_ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@example.com", "message": "Hello!"}'
```

---

## Group Service
Manages user group memberships.
- **Methods:** `GET`, `POST`
- **Endpoint:** `.../group-service?group_id=<id>`
- **Auth:** User JWT
- **Examples:**
  - **GET members:** `curl '.../group-service?group_id=1' -H 'Authorization: Bearer <USER_JWT>'`
  - **POST add member:** `curl -X POST '.../group-service?group_id=1' -H '...' -d '{"user_id": "..."}'`

---

## Onboarding Service
Updates a user's onboarding status.
- **Method:** `POST`
- **Endpoint:** `.../onboarding-service`
- **Auth:** User JWT
- **Example:**
```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/onboarding-service' \
  -H 'Authorization: Bearer <USER_JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"step_completed": "profile_created"}'
```

---

## Order Service
Fetches orders for the authenticated user.
- **Method:** `GET`
- **Endpoint:** `.../order-service`
- **Auth:** User JWT
- **Example:**
`curl '.../order-service' -H 'Authorization: Bearer <USER_JWT>'`

---

## Page Service
Fetches page content for a CMS by slug.
- **Method:** `GET`
- **Endpoint:** `.../page-service?slug=<page_slug>`
- **Auth:** Anon Key
- **Example:**
`curl '.../page-service?slug=about-us' -H 'apikey: <SUPABASE_ANON_KEY>'`

---

## Product Service
Fetches all products or a single product.
- **Method:** `GET`
- **Auth:** Anon Key
- **Examples:**
  - **GET all:** `curl '.../product-service' -H 'apikey: <SUPABASE_ANON_KEY>'`
  - **GET one:** `curl '.../product-service?id=1' -H 'apikey: <SUPABASE_ANON_KEY>'`

---

## Profile Service
Gets or updates the authenticated user's profile.
- **Methods:** `GET`, `PUT`
- **Endpoint:** `.../profile-service`
- **Auth:** User JWT
- **Examples:**
  - **GET:** `curl '.../profile-service' -H 'Authorization: Bearer <USER_JWT>'`
  - **PUT:** `curl -X PUT '.../profile-service' -H '...' -d '{"username": "new_name"}'`

---

## Proofing Service
Submits a status for a design proof (e.g., 'approved').
- **Method:** `POST`
- **Endpoint:** `.../proofing-service`
- **Auth:** User JWT
- **Example:**
```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/proofing-service' \
  -H 'Authorization: Bearer <USER_JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"proof_id": 1, "status": "approved", "comments": "Looks great!"}'
```

---

## Portal Service
Aggregates various data (profile, orders, etc.) for a customer portal.
- **Method:** `GET`
- **Endpoint:** `.../portal-service`
- **Auth:** User JWT
- **Example:**
`curl '.../portal-service' -H 'Authorization: Bearer <USER_JWT>'`

---

## SEO Service
Fetches SEO metadata for a given URL path.
- **Method:** `GET`
- **Endpoint:** `.../seo-service?path=<url_path>`
- **Auth:** Anon Key
- **Example:**
`curl '.../seo-service?path=/products/cool-widget' -H 'apikey: <SUPABASE_ANON_KEY>'`

---

## Storage Service
Creates a signed URL for secure, direct file uploads.
- **Method:** `POST`
- **Endpoint:** `.../storage-service`
- **Auth:** User JWT (The function uses the Service Role key internally)
- **Example:**
```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/storage-service' \
  -H 'Authorization: Bearer <USER_JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"bucket": "avatars", "path": "my-avatar.png"}'
```

---

## Task Service
Performs CRUD operations on tasks for the authenticated user.
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`
- **Auth:** User JWT
- **Examples:**
  - **GET all:** `curl .../task-service -H 'Authorization: Bearer <USER_JWT>'`
  - **POST new:** `curl -X POST .../task-service -H '...' -d '{"title": "My new task"}'`
  - **PUT update:** `curl -X PUT .../task-service?id=1 -H '...' -d '{"is_completed": true}'`
  - **DELETE:** `curl -X DELETE .../task-service?id=1 -H 'Authorization: Bearer <USER_JWT>'`

---

## Team Service
Fetches all teams the authenticated user is a member of.
- **Method:** `GET`
- **Endpoint:** `.../team-service`
- **Auth:** User JWT
- **Example:**
`curl '.../team-service' -H 'Authorization: Bearer <USER_JWT>'`
