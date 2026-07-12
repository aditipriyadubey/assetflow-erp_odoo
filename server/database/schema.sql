-- =====================================================================
-- AssetFlow — server/database/schema.sql
-- Owner: Developer 3 (sole owner — others request changes via PR/issue,
-- never edit this file directly. See 04_Shared_Contracts §B / §C.11)
--
-- Generated 1:1 from SDD Part 1 §13 "Complete Table Design".
-- Engine: MySQL 8.0, InnoDB, utf8mb4 (per SDD §11 Database Design Principles).
-- No deviation from the SDD without updating that document first.
--
-- Table creation order respects FK dependencies. The one circular
-- reference (departments.head_user_id <-> users.department_id) is
-- resolved by adding departments.head_user_id's FK constraint via
-- ALTER TABLE after both tables exist (see section 3 below).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Database
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS assetflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE assetflow_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. departments  (SDD §13.1)
--    NOTE: head_user_id FK is added later (see section 3) because
--    `users` does not exist yet — departments and users reference
--    each other (circular dependency).
-- ---------------------------------------------------------------------
CREATE TABLE departments (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                  VARCHAR(120) NOT NULL,
  head_user_id          BIGINT UNSIGNED NULL,
  parent_department_id  BIGINT UNSIGNED NULL,
  status                ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name),
  KEY idx_dept_parent (parent_department_id),
  CONSTRAINT fk_departments_parent
    FOREIGN KEY (parent_department_id) REFERENCES departments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. users  (SDD §13.2)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                  VARCHAR(120) NOT NULL,
  email                 VARCHAR(160) NOT NULL,
  password_hash         VARCHAR(255) NOT NULL,
  role                  ENUM('Admin','AssetManager','DepartmentHead','Employee') NOT NULL DEFAULT 'Employee',
  department_id         BIGINT UNSIGNED NULL,
  status                ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  reset_token           VARCHAR(255) NULL,
  reset_token_expires   TIMESTAMP NULL DEFAULT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_dept (department_id),
  KEY idx_users_role (role),
  CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Resolve the circular FK: departments.head_user_id -> users.id
-- ---------------------------------------------------------------------
ALTER TABLE departments
  ADD CONSTRAINT fk_departments_head_user
    FOREIGN KEY (head_user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 4. asset_categories  (SDD §13.3)
-- ---------------------------------------------------------------------
CREATE TABLE asset_categories (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  description    VARCHAR(255) NULL,
  custom_fields  JSON NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. assets  (SDD §13.4) — module owned by Developer 2; table lives
--    here because Developer 3 is the sole owner of schema.sql.
-- ---------------------------------------------------------------------
CREATE TABLE assets (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_tag          VARCHAR(20) NOT NULL,
  name               VARCHAR(150) NOT NULL,
  category_id        BIGINT UNSIGNED NOT NULL,
  serial_number      VARCHAR(100) NULL,
  qr_code_value      VARCHAR(150) NULL,
  acquisition_date   DATE NULL,
  acquisition_cost   DECIMAL(12,2) NULL,
  `condition`        ENUM('New','Good','Fair','Poor','Damaged') NOT NULL DEFAULT 'New',
  location           VARCHAR(150) NULL,
  photo_url          VARCHAR(255) NULL,
  is_bookable        BOOLEAN NOT NULL DEFAULT FALSE,
  status             ENUM('Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed') NOT NULL DEFAULT 'Available',
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assets_tag (asset_tag),
  UNIQUE KEY uq_assets_serial (serial_number),
  UNIQUE KEY uq_assets_qr (qr_code_value),
  KEY idx_assets_category (category_id),
  KEY idx_assets_status (status),
  KEY idx_assets_location (location),
  CONSTRAINT fk_assets_category
    FOREIGN KEY (category_id) REFERENCES asset_categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. asset_allocations  (SDD §13.5) — module owned by Developer 2.
--    Business constraint "at most one Active allocation per asset" is
--    enforced in the service layer via SELECT ... FOR UPDATE inside a
--    transaction (MySQL has no native partial-unique index) — NOT here.
-- ---------------------------------------------------------------------
CREATE TABLE asset_allocations (
  id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id                 BIGINT UNSIGNED NOT NULL,
  employee_id              BIGINT UNSIGNED NULL,
  department_id            BIGINT UNSIGNED NULL,
  allocated_date           DATE NOT NULL,
  expected_return_date     DATE NULL,
  actual_return_date       DATE NULL,
  condition_checkin_notes  VARCHAR(500) NULL,
  status                   ENUM('Active','Returned','Overdue') NOT NULL DEFAULT 'Active',
  allocated_by             BIGINT UNSIGNED NOT NULL,
  created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alloc_asset_status (asset_id, status),
  KEY idx_alloc_employee (employee_id),
  CONSTRAINT fk_alloc_asset
    FOREIGN KEY (asset_id) REFERENCES assets (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_alloc_employee
    FOREIGN KEY (employee_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_alloc_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_alloc_allocated_by
    FOREIGN KEY (allocated_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. transfer_requests  (SDD §13.6) — module owned by Developer 2.
-- ---------------------------------------------------------------------
CREATE TABLE transfer_requests (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id       BIGINT UNSIGNED NOT NULL,
  from_user_id   BIGINT UNSIGNED NULL,
  to_user_id     BIGINT UNSIGNED NOT NULL,
  requested_by   BIGINT UNSIGNED NOT NULL,
  status         ENUM('Requested','Approved','Rejected') NOT NULL DEFAULT 'Requested',
  approved_by    BIGINT UNSIGNED NULL,
  requested_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at    TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_transfer_asset (asset_id),
  KEY idx_transfer_status (status),
  CONSTRAINT fk_transfer_asset
    FOREIGN KEY (asset_id) REFERENCES assets (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transfer_from_user
    FOREIGN KEY (from_user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transfer_to_user
    FOREIGN KEY (to_user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transfer_requested_by
    FOREIGN KEY (requested_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transfer_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. bookings  (SDD §13.7) — module co-owned by Developer 4 / Developer 2.
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id       BIGINT UNSIGNED NOT NULL,
  booked_by      BIGINT UNSIGNED NOT NULL,
  department_id  BIGINT UNSIGNED NULL,
  purpose        VARCHAR(255) NULL,
  start_time     DATETIME NOT NULL,
  end_time       DATETIME NOT NULL,
  status         ENUM('Upcoming','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Upcoming',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_asset_time (asset_id, start_time, end_time),
  CONSTRAINT chk_bookings_time_order CHECK (end_time > start_time),
  CONSTRAINT fk_bookings_asset
    FOREIGN KEY (asset_id) REFERENCES assets (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_booked_by
    FOREIGN KEY (booked_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. maintenance_requests  (SDD §13.8) — module owned by Developer 4.
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_requests (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id            BIGINT UNSIGNED NOT NULL,
  raised_by           BIGINT UNSIGNED NOT NULL,
  issue_description   VARCHAR(1000) NOT NULL,
  priority            ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  photo_url           VARCHAR(255) NULL,
  status              ENUM('Pending','Approved','Rejected','TechnicianAssigned','InProgress','Resolved') NOT NULL DEFAULT 'Pending',
  approved_by         BIGINT UNSIGNED NULL,
  technician_name     VARCHAR(120) NULL,
  resolved_at         TIMESTAMP NULL DEFAULT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_maint_asset (asset_id),
  KEY idx_maint_status (status),
  KEY idx_maint_priority (priority),
  CONSTRAINT fk_maint_asset
    FOREIGN KEY (asset_id) REFERENCES assets (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_maint_raised_by
    FOREIGN KEY (raised_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_maint_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. audit_cycles  (SDD §13.9) — module owned by Developer 4.
-- ---------------------------------------------------------------------
CREATE TABLE audit_cycles (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(150) NOT NULL,
  department_id  BIGINT UNSIGNED NULL,
  location       VARCHAR(150) NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  status         ENUM('Draft','InProgress','Closed') NOT NULL DEFAULT 'Draft',
  created_by     BIGINT UNSIGNED NOT NULL,
  closed_at      TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_cycles_department (department_id),
  KEY idx_audit_cycles_status (status),
  CONSTRAINT fk_audit_cycles_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_audit_cycles_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. audit_cycle_auditors  (SDD §13.10, join table)
--     Tied 1:1 to its parent audit_cycles row -> CASCADE on that side.
--     auditor_id references master data (users) -> RESTRICT.
-- ---------------------------------------------------------------------
CREATE TABLE audit_cycle_auditors (
  audit_cycle_id  BIGINT UNSIGNED NOT NULL,
  auditor_id      BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (audit_cycle_id, auditor_id),
  KEY idx_auditors_auditor (auditor_id),
  CONSTRAINT fk_auditors_cycle
    FOREIGN KEY (audit_cycle_id) REFERENCES audit_cycles (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_auditors_user
    FOREIGN KEY (auditor_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. audit_items  (SDD §13.11)
--     Tied 1:1 to its parent audit_cycles row -> CASCADE on that side.
-- ---------------------------------------------------------------------
CREATE TABLE audit_items (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  audit_cycle_id        BIGINT UNSIGNED NOT NULL,
  asset_id              BIGINT UNSIGNED NOT NULL,
  verification_status   ENUM('Pending','Verified','Missing','Damaged') NOT NULL DEFAULT 'Pending',
  notes                 VARCHAR(500) NULL,
  verified_by           BIGINT UNSIGNED NULL,
  verified_at           TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_audit_items_cycle_asset (audit_cycle_id, asset_id),
  KEY idx_audit_items_asset (asset_id),
  CONSTRAINT fk_audit_items_cycle
    FOREIGN KEY (audit_cycle_id) REFERENCES audit_cycles (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_audit_items_asset
    FOREIGN KEY (asset_id) REFERENCES assets (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_audit_items_verified_by
    FOREIGN KEY (verified_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. discrepancy_reports  (SDD §13.12)
--     Tied 1:1 to its parent audit_items row -> CASCADE.
-- ---------------------------------------------------------------------
CREATE TABLE discrepancy_reports (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  audit_item_id       BIGINT UNSIGNED NOT NULL,
  issue_type          ENUM('Missing','Damaged') NOT NULL,
  description         VARCHAR(500) NULL,
  resolution_status   ENUM('Open','Resolved') NOT NULL DEFAULT 'Open',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_discrepancy_item (audit_item_id),
  CONSTRAINT fk_discrepancy_audit_item
    FOREIGN KEY (audit_item_id) REFERENCES audit_items (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. notifications  (SDD §13.13) — module owned by Developer 3.
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id               BIGINT UNSIGNED NOT NULL,
  type                  VARCHAR(60) NOT NULL,
  message               VARCHAR(255) NOT NULL,
  related_entity_type   VARCHAR(50) NULL,
  related_entity_id     BIGINT UNSIGNED NULL,
  is_read               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. activity_logs  (SDD §13.14) — module owned by Developer 3.
--     Append-only: no UPDATE/DELETE endpoint is ever exposed on this
--     table at the application layer (SDD §31 Security Practices).
-- ---------------------------------------------------------------------
CREATE TABLE activity_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50) NOT NULL,
  entity_id    BIGINT UNSIGNED NOT NULL,
  details      JSON NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_log_entity (entity_type, entity_id),
  KEY idx_log_user (user_id),
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- End of schema.sql
-- Do not edit schema.sql directly once seeded/demo data exists in a
-- shared environment — add a new numbered file under
-- server/database/migrations/ instead (SDD §37 Deployment Strategy).
-- =====================================================================