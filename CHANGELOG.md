# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

---

**Update 24/06/2026 — User Profile Loading (#25)**  
**Goal.** Fix user profile data loading issues.  
**Description.** Fixed register page template and corrected profile page component to properly load and display user profile fields on initialization.

---

**Update 18/06/2026 — Team Details Race Condition (#24)**  
**Goal.** Eliminate race condition in team details modal.  
**Description.** Added lifecycle guard to the team-details-modal component to prevent data fetch conflicts when opening team details, and removed stale profile subscription cleanup.

---

**Update 17/06/2026 — Profile Component Fields (#22)**  
**Goal.** Fix incorrect profile component field bindings.  
**Description.** Simplified profile-page component by removing redundant field assignments and streamlining the data-binding logic for user profile fields.

---

**Update 16/06/2026 — Auth Templates (#21)**  
**Goal.** Refactor authentication page templates for consistency.  
**Description.** Updated login and register page templates to use cleaner Angular control-flow syntax, improved form field bindings, and aligned component logic with the updated templates.

---

**Update 16/06/2026 — Auth Interceptor (#20)**  
**Goal.** Improve authentication interceptor reliability and test coverage.  
**Description.** Refactored the auth interceptor to use the auth service's token accessor, expanded interceptor unit tests with additional scenarios, and added a public token-getter method to the auth service.

---

**Update 16/06/2026 — Jest Environment Import (#19)**  
**Goal.** Fix environment variable access in the Jest test runner.  
**Description.** Introduced an `import-meta-env` abstraction with a dedicated mock for Jest, updated `env.config` and `jwt.config` to use the new accessor, and registered the mock in `jest.config.ts` setup files.

---

**Update 16/06/2026 — Profile Form (#18)**  
**Goal.** Refactor the profile form for better reactivity and validation.  
**Description.** Rewrote the profile-page component to use reactive form controls, improved template layout with updated field bindings and styles, and removed unused login-page import.

---

**Update 15/06/2026 — Icons Fix (#17)**  
**Goal.** Add missing icon to the shared icons module.  
**Description.** Added the `lucideUserMinus` icon to the icons module so the "remove user" action renders correctly across the application.

---

**Update 15/06/2026 — OnPush Change Detection (#16)**  
**Goal.** Enable OnPush change detection strategy on dashboard tab components.  
**Description.** Set `changeDetection: ChangeDetectionStrategy.OnPush` on the logs-tab, teams-tab, tickets-tab, and users-tab components to reduce unnecessary change-detection cycles.

---

**Update 12/06/2026 — Component Responsibility (#15)**  
**Goal.** Clarify component and service responsibilities in the dashboard.  
**Description.** Simplified team-details-modal subscription logic, extracted private helper methods from the dashboard component, made dashboard-logs service private with encapsulated properties, and fixed log pagination reloading.

---

**Update 10/06/2026 — Dashboard Services (#14)**  
**Goal.** Extract domain logic from the dashboard component into dedicated services.  
**Description.** Created `dashboard-logs`, `dashboard-teams`, `dashboard-ticket`, and `dashboard-user` services; extracted ticket fetching, filtration, creation, and user/log management from the monolithic dashboard component; added error streams to ticket service; improved code formatting and component styles across all dashboard tabs, modals, auth pages, profile page, and global styles; updated README, ADRs, Jest and TypeScript configs, and `index.html`.

---

**Update 05/06/2026 — Modals (#13)**  
**Goal.** Separate modal components from the dashboard page.  
**Description.** Extracted create-team-modal, create-ticket-modal, and team-details-modal into standalone components with their own templates, styles, and logic, reducing the dashboard-page component size significantly.

---

**Update 04/06/2026 — Services (#12)**  
**Goal.** Centralize local-storage and auth token management in the auth service.  
**Description.** Added `saveToken`, `getToken`, and role-accessor methods to the auth service; replaced direct `localStorage` calls in the auth guard, login page, dashboard component, and profile page with service methods; added subscription cleanup with `OnDestroy`, and replaced deprecated RxJS syntax in the profile page.

---

**Update 02/06/2026 — Typization (#11)**  
**Goal.** Strengthen TypeScript typings across DTOs and services.  
**Description.** Introduced `ActivityLogDto`, expanded `TeamDto`, `TicketDto`, and `UserDto` with proper typed fields; updated all core services and dashboard tab components to use the refined DTO interfaces; adjusted JWT utility and token-validation option types.

---

**Update 01/06/2026 — Dashboard Template (#10)**  
**Goal.** Break the dashboard into tab-based child components.  
**Description.** Extracted logs-tab, teams-tab, tickets-tab, and users-tab into separate components with individual templates, styles, and specs; streamlined the parent dashboard-page template and component; simplified ticket-details-modal bindings.

---

**Update 28/05/2026 — Templates Syntax (#9)**  
**Goal.** Migrate dashboard templates to modern Angular control-flow syntax.  
**Description.** Rewrote dashboard-page and ticket-details-modal templates using `@if`, `@for`, and `@switch` blocks replacing legacy `*ngIf`, `*ngFor`, and `[ngSwitch]` directives; updated component event bindings accordingly.

---

**Update 04/03/2026 — Ticket Details Modal Extraction (#8)**  
**Goal.** Extract ticket-details modal into a standalone component.  
**Description.** Separated the ticket-details modal template, styles, and logic from the dashboard page into a dedicated `ticket-details-modal` component; added a `TicketDto` status field; adjusted ticket service for the new component interface; cleaned up unused dashboard styles and CSS.

---

**Update 27/02/2026 — JWT Validation & Environment Config (#7)**  
**Goal.** Add strict JWT token validation and environment configuration.  
**Description.** Integrated Zod for JWT payload schema validation, introduced `jwt.config` and `token.validation.options`, added token-validation logic to the auth guard, created a typed `env.d.ts` for environment variables, and updated `angular.json` build configuration.

---

**Update 25/02/2026 — JWT Payload & Local Storage Fixes (#6)**  
**Goal.** Fix JWT decoding and local-storage data handling.  
**Description.** Extracted a dedicated `JwtPayload` DTO, removed unnecessary JWT utility methods, fixed first/last name local-storage assignments, and cleaned up formatting across login and dashboard components.

---

**Update 20/02/2026 — Routes Refactoring (#5)**  
**Goal.** Split monolithic route definitions into feature-based route files.  
**Description.** Moved route declarations from `app.routes.ts` into dedicated `auth.routes.ts`, `dashboard.routes.ts`, and `settings.routes.ts` files with a barrel `index.ts`; updated `angular.json` and `app.config` accordingly.

---

**Update 11/12/2025 — Manager Feature (#4)**  
**Goal.** Implement the manager-level administration interface.  
**Description.** Restructured DTOs into separate files (`team.dto`, `ticket.dto`, `user.dto`, `category.enum`); renamed test interceptor to auth interceptor; moved shared services into `core/services`; converted feature modules to standalone route-based lazy loading; removed legacy test scaffolding (test directive, pipe, service, component, module); expanded dashboard page with management capabilities; and updated global styles.

---

**Update 08/12/2025 — Dashboard Feature (#3)**  
**Goal.** Build the main dashboard view with ticket management.  
**Description.** Created the dashboard page with ticket listing, filtering, and detail views; added profile-page component under settings; introduced the auth guard, JWT utility helper, and shared icons module; expanded DTOs with team and user types; updated global styles and routing.

---

**Update 08/12/2025 — Initial Release (#2)**  
**Goal.** Merge the development branch into production for the first release.  
**Description.** Combined auth-page and dashboard features into a single release branch, delivering the complete initial feature set with authentication pages, dashboard views, core services, and API configuration.

---

**Update 05/12/2025 — Auth Page (#1)**  
**Goal.** Implement the authentication UI (login & registration).  
**Description.** Created login-page and register-page components with form validation and server-error handling; added auth, teams, tickets, users, and activity-log services; configured API endpoint settings and routing; established initial project scaffolding.
