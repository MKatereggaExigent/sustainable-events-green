-- Seed data for EventCarbon

-- ============================================
-- PERMISSIONS
-- ============================================
INSERT INTO permissions (name, description, resource, action) VALUES
-- Organization permissions
('organization:read', 'View organization details', 'organization', 'read'),
('organization:update', 'Update organization settings', 'organization', 'update'),
('organization:delete', 'Delete organization', 'organization', 'delete'),
('organization:manage_members', 'Manage organization members', 'organization', 'manage_members'),

-- User permissions
('user:read', 'View user profiles', 'user', 'read'),
('user:update', 'Update user profiles', 'user', 'update'),
('user:delete', 'Delete users', 'user', 'delete'),
('user:manage_roles', 'Manage user roles', 'user', 'manage_roles'),

-- Event permissions
('event:create', 'Create events', 'event', 'create'),
('event:read', 'View events', 'event', 'read'),
('event:update', 'Update events', 'event', 'update'),
('event:delete', 'Delete events', 'event', 'delete'),
('event:publish', 'Publish events', 'event', 'publish'),

-- Cost & Savings permissions
('cost:read', 'View cost data', 'cost', 'read'),
('cost:update', 'Update cost data', 'cost', 'update'),

-- Tax Incentives permissions
('incentive:read', 'View tax incentives', 'incentive', 'read'),
('incentive:apply', 'Apply for tax incentives', 'incentive', 'apply'),

-- Reports permissions
('report:read', 'View reports', 'report', 'read'),
('report:export', 'Export reports', 'report', 'export'),

-- Admin permissions
('admin:access', 'Access admin panel', 'admin', 'access'),
('admin:audit_logs', 'View audit logs', 'admin', 'audit_logs');

-- ============================================
-- SYSTEM ROLES (organization_id = NULL)
-- ============================================
INSERT INTO roles (name, description, organization_id, is_system_role) VALUES
('super_admin', 'Super Administrator with full system access', NULL, true),
('org_owner', 'Organization Owner with full org access', NULL, true),
('org_admin', 'Organization Administrator', NULL, true),
('org_member', 'Organization Member with basic access', NULL, true),
('org_viewer', 'Read-only organization access', NULL, true);

-- ============================================
-- ROLE-PERMISSION MAPPINGS
-- ============================================

-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin';

-- Org Owner permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'org_owner' AND p.name IN (
    'organization:read', 'organization:update', 'organization:delete', 'organization:manage_members',
    'user:read', 'user:update', 'user:delete', 'user:manage_roles',
    'event:create', 'event:read', 'event:update', 'event:delete', 'event:publish',
    'cost:read', 'cost:update', 'incentive:read', 'incentive:apply',
    'report:read', 'report:export', 'admin:access', 'admin:audit_logs'
);

-- Org Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'org_admin' AND p.name IN (
    'organization:read', 'organization:update', 'organization:manage_members',
    'user:read', 'user:update', 'user:manage_roles',
    'event:create', 'event:read', 'event:update', 'event:delete', 'event:publish',
    'cost:read', 'cost:update', 'incentive:read', 'incentive:apply',
    'report:read', 'report:export', 'admin:access'
);

-- Org Member permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'org_member' AND p.name IN (
    'organization:read',
    'user:read',
    'event:create', 'event:read', 'event:update',
    'cost:read', 'cost:update', 'incentive:read',
    'report:read'
);

-- Org Viewer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'org_viewer' AND p.name IN (
    'organization:read', 'user:read', 'event:read', 'cost:read', 'incentive:read', 'report:read'
);

-- ============================================
-- TAX INCENTIVES
-- ============================================
INSERT INTO tax_incentives (name, description, region, category, percentage_credit, max_credit, eligibility_criteria, is_active) VALUES
-- US Incentives
('Renewable Energy Tax Credit', 'Federal tax credit for using renewable energy at events', 'us', 'energy', 30.00, 10000.00, '["Use 80%+ renewable energy", "Events over 100 attendees"]', true),
('Carbon Offset Deduction', 'Deduction for verified carbon offset purchases', 'us', 'carbon', 15.00, 5000.00, '["Purchase verified carbon offsets", "Document emissions reduced"]', true),
('Waste Diversion Incentive', 'Credit for achieving 75%+ waste diversion from landfills', 'us', 'waste', 20.00, 3000.00, '["Achieve 75%+ waste diversion", "Use certified recycling vendors"]', true),
('Green Building Credit', 'Credit for events in LEED-certified venues', 'us', 'general', 10.00, 2500.00, '["Use LEED-certified venue", "Document energy savings"]', true),

-- EU Incentives
('EU Green Event Certification Grant', 'Grant for events meeting EU sustainability standards', 'eu', 'general', 25.00, 15000.00, '["Meet EU Ecolabel standards", "Complete certification process"]', true),
('Carbon Neutral Event Bonus', 'Additional funding for achieving carbon neutrality', 'eu', 'carbon', 35.00, 20000.00, '["Achieve verified carbon neutrality", "Third-party verification"]', true),
('Circular Economy Grant', 'Support for zero-waste event initiatives', 'eu', 'waste', 30.00, 12000.00, '["Implement circular economy practices", "90%+ material recovery"]', true),

-- UK Incentives
('UK Energy Savings Opportunity Scheme', 'Compliance credit for energy-efficient events', 'uk', 'energy', 20.00, 8000.00, '["Submit energy audit", "Implement efficiency measures"]', true),
('UK Plastic Packaging Tax Relief', 'Relief for avoiding single-use plastics', 'uk', 'waste', 15.00, 4000.00, '["Use no single-use plastics", "Document alternatives used"]', true),

-- Canada Incentives
('Canada Green Business Credit', 'Federal credit for sustainable business practices', 'ca', 'general', 15.00, 7500.00, '["Register as green business", "Annual sustainability reporting"]', true),
('Canada Carbon Tax Rebate', 'Rebate for carbon-efficient operations', 'ca', 'carbon', 20.00, 6000.00, '["Reduce emissions below baseline", "Document reduction measures"]', true),

-- Australia Incentives
('Australia Emissions Reduction Fund', 'Grants for verified emissions reduction', 'au', 'carbon', 25.00, 10000.00, '["Register with Clean Energy Regulator", "Verified emissions reduction"]', true),
('Australia Renewable Energy Target Credit', 'Credit for using renewable energy', 'au', 'energy', 18.00, 5500.00, '["Source 50%+ renewable energy", "Provide energy certificates"]', true);

