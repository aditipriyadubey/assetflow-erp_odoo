-- =====================================================================
-- AssetFlow — server/database/seed.sql
-- Owner: Developer 3
--
-- Demo/local data only — never run against a real production database.
-- Assumes schema.sql has just been applied to an EMPTY assetflow_db
-- (auto-increment ids below rely on sequential inserts starting at 1).
--
-- All seeded accounts share one demo password for convenience:
--   password: Password123
--   bcrypt hash (cost factor 10, matches BCRYPT_SALT_ROUNDS in .env.example):
--   $2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO
--
-- Design intent: seed just enough org data (departments, categories,
-- users, a few assets) to make the app non-empty on first login,
-- while leaving the live "Organization Setup", "Transfer", and
-- "Audit" steps of the Demo Flow (SDD §36) for the actual demo —
-- we don't want to pre-empt what the judges are supposed to see
-- happen live.
-- =====================================================================

USE assetflow_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE discrepancy_reports;
TRUNCATE TABLE audit_items;
TRUNCATE TABLE audit_cycle_auditors;
TRUNCATE TABLE audit_cycles;
TRUNCATE TABLE maintenance_requests;
TRUNCATE TABLE bookings;
TRUNCATE TABLE transfer_requests;
TRUNCATE TABLE asset_allocations;
TRUNCATE TABLE assets;
TRUNCATE TABLE asset_categories;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. departments
--    head_user_id left NULL for now; backfilled after users are
--    inserted below (avoids the circular FK ordering problem).
-- ---------------------------------------------------------------------
INSERT INTO departments (id, name, head_user_id, parent_department_id, status) VALUES
  (1, 'Engineering',       NULL, NULL, 'Active'),
  (2, 'Human Resources',   NULL, NULL, 'Active');

-- ---------------------------------------------------------------------
-- 2. users
--    Per SDD FR-1.1 / §6, in a real signup flow every new account is
--    forced to 'Employee' and role is elevated only via
--    PATCH /users/:id/role by an Admin. These seed rows bypass that
--    flow purely to give the demo a non-empty starting roster; the
--    Admin row below represents the single seeded first account.
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, department_id, status) VALUES
  (1, 'System Admin',   'admin@assetflow.local',        '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'Admin',          NULL, 'Active'),
  (2, 'Asha Verma',     'asha.verma@assetflow.local',    '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'AssetManager',   1,    'Active'),
  (3, 'Rohit Mehta',    'rohit.mehta@assetflow.local',   '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'DepartmentHead', 1,    'Active'),
  (4, 'Priya Sharma',   'priya.sharma@assetflow.local',  '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'Employee',       1,    'Active'),
  (5, 'Karan Patel',    'karan.patel@assetflow.local',   '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'Employee',       2,    'Active'),
  (6, 'Neha Gupta',     'neha.gupta@assetflow.local',    '$2b$10$75I7Zqpvay1uxZXwMC5mIObOW0lSTihFs8Na1l7IDohyg0OfQM1XO', 'Employee',       2,    'Active');

-- Backfill department heads now that users exist.
UPDATE departments SET head_user_id = 3 WHERE id = 1; -- Rohit Mehta heads Engineering
-- HR intentionally left without a head — Demo Flow §36 step 2 promotes
-- an Employee (e.g. Neha Gupta) live during the demo.

-- ---------------------------------------------------------------------
-- 3. asset_categories
-- ---------------------------------------------------------------------
INSERT INTO asset_categories (id, name, description, custom_fields) VALUES
  (1, 'Laptops',    'Portable computing devices issued to staff', JSON_OBJECT('warranty_months', 24)),
  (2, 'Furniture',  'Office furniture and fixtures',               NULL),
  (3, 'Projectors', 'Shared AV equipment for meeting rooms',       JSON_OBJECT('warranty_months', 12));

-- ---------------------------------------------------------------------
-- 4. assets
-- ---------------------------------------------------------------------
INSERT INTO assets
  (id, asset_tag, name, category_id, serial_number, qr_code_value, acquisition_date, acquisition_cost, `condition`, location, photo_url, is_bookable, status) VALUES
  (1, 'AF-0001', 'Dell Latitude 5440',        1, 'DL5440-0001', 'QR-AF-0001', '2024-02-15', 78500.00, 'Good', 'HQ - 3rd Floor',      NULL, FALSE, 'Available'),
  (2, 'AF-0002', 'HP EliteBook 840',          1, 'HP840-0002',  'QR-AF-0002', '2024-06-01', 82000.00, 'New',  'HQ - 3rd Floor',      NULL, FALSE, 'Allocated'),
  (3, 'AF-0003', 'Conference Room Projector', 3, 'PRJ-0003',    'QR-AF-0003', '2023-11-10', 45000.00, 'Good', 'HQ - Conf Room A',    NULL, TRUE,  'Available'),
  (4, 'AF-0004', 'Ergonomic Office Chair',    2, 'CHR-0004',    'QR-AF-0004', '2022-08-20', 12500.00, 'Fair', 'HQ - 2nd Floor',      NULL, FALSE, 'Under Maintenance'),
  (5, 'AF-0005', 'Standing Desk',             2, 'DSK-0005',    'QR-AF-0005', '2023-03-05', 21000.00, 'Good', 'HQ - 2nd Floor',      NULL, FALSE, 'Available');

-- ---------------------------------------------------------------------
-- 5. asset_allocations
--    AF-0002 is actively held by Priya Sharma (Engineering).
-- ---------------------------------------------------------------------
INSERT INTO asset_allocations
  (id, asset_id, employee_id, department_id, allocated_date, expected_return_date, actual_return_date, condition_checkin_notes, status, allocated_by) VALUES
  (1, 2, 4, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), NULL, NULL, 'Active', 2);

-- ---------------------------------------------------------------------
-- 6. bookings
--    AF-0003 (bookable projector) has one upcoming booking, so the
--    overlap-rejection step of the Demo Flow has a real slot to
--    collide with.
-- ---------------------------------------------------------------------
INSERT INTO bookings (id, asset_id, booked_by, department_id, purpose, start_time, end_time, status) VALUES
  (1, 3, 5, 2, 'Quarterly HR review meeting',
      TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'),
      TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'),
      'Upcoming');

-- ---------------------------------------------------------------------
-- 7. maintenance_requests
--    AF-0004 is Under Maintenance, matching its asset row above.
-- ---------------------------------------------------------------------
INSERT INTO maintenance_requests
  (id, asset_id, raised_by, issue_description, priority, photo_url, status, approved_by, technician_name, resolved_at) VALUES
  (1, 4, 4, 'Chair hydraulic lift no longer holds height under normal use.', 'Medium', NULL, 'Approved', 2, NULL, NULL);

-- ---------------------------------------------------------------------
-- 8. notifications
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, user_id, type, message, related_entity_type, related_entity_id, is_read) VALUES
  (1, 4, 'ASSET_ASSIGNED',        'You have been assigned asset AF-0002 (HP EliteBook 840).',              'asset_allocations',    1, FALSE),
  (2, 4, 'MAINTENANCE_APPROVED',  'Your maintenance request for AF-0004 has been approved.',                'maintenance_requests', 1, FALSE);

-- ---------------------------------------------------------------------
-- 9. activity_logs (append-only audit trail — SDD §31)
-- ---------------------------------------------------------------------
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details) VALUES
  (1, 2, 'ASSET_REGISTERED',        'assets',              1, JSON_OBJECT('asset_tag', 'AF-0001')),
  (2, 2, 'ASSET_ALLOCATED',         'asset_allocations',   1, JSON_OBJECT('asset_tag', 'AF-0002', 'employee', 'Priya Sharma')),
  (3, 2, 'MAINTENANCE_APPROVED',    'maintenance_requests',1, JSON_OBJECT('asset_tag', 'AF-0004'));

-- =====================================================================
-- Note: transfer_requests, audit_cycles, audit_cycle_auditors,
-- audit_items, and discrepancy_reports are intentionally left empty —
-- they are created live during the Demo Flow (SDD §36 steps 4 and 7).
-- =====================================================================