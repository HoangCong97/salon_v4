-- PostgreSQL Schema for SaaS Multi-Tenant Salon App (MVP - Phase 1)
-- All tables are prefixed with 'sal_' as requested.
-- Primary keys and Foreign keys use UUID.
-- Soft delete columns (deleted_at) are present in all tables.

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. SAAS HIERARCHY
-- =========================================================================
CREATE DATABASE salon_app_db;

CREATE TABLE sal_saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    max_branches INTEGER NOT NULL DEFAULT 1,
    max_staff INTEGER NOT NULL DEFAULT 5,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sal_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    plan_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_tenants_plan FOREIGN KEY (plan_id) REFERENCES sal_saas_plans (id) ON DELETE SET NULL
);

CREATE TABLE sal_saas_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    plan_id UUID,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_saas_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_saas_invoices_plan FOREIGN KEY (plan_id) REFERENCES sal_saas_plans (id) ON DELETE SET NULL
);

CREATE TABLE sal_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_branches_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE
);

-- =========================================================================
-- 2. USER AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
-- =========================================================================

CREATE TABLE sal_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_roles_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE
);

CREATE TABLE sal_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug VARCHAR(100) NOT NULL,
    group_name VARCHAR(100) NOT NULL, -- Renamed from 'group' as it's a SQL reserved keyword
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sal_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sal_role_permissions_role FOREIGN KEY (role_id) REFERENCES sal_roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES sal_permissions (id) ON DELETE CASCADE,
    CONSTRAINT uq_sal_role_permissions_link UNIQUE (role_id, permission_id)
);

CREATE TABLE sal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    role_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    sex VARCHAR(10),
    avatar TEXT,
    base_salary NUMERIC(15, 0) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_users_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_users_role FOREIGN KEY (role_id) REFERENCES sal_roles (id) ON DELETE SET NULL
);

CREATE TABLE sal_user_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_user_branches_user FOREIGN KEY (user_id) REFERENCES sal_users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_user_branches_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE
);

CREATE TABLE sal_user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    theme VARCHAR(50) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'vi',
    timezone VARCHAR(100) DEFAULT 'Asia/Ho_Chi_Minh',
    receive_notification BOOLEAN DEFAULT TRUE,
    receive_sms BOOLEAN DEFAULT FALSE,
    receive_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_user_settings_user FOREIGN KEY (user_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. CUSTOMER MANAGEMENT
-- =========================================================================

CREATE TABLE sal_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    password VARCHAR(255), -- Nullable for offline/walk-in clients
    credibility_score INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_customers_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_customers_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL
);

CREATE TABLE sal_customer_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    customer_id UUID NOT NULL,
    point INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_customer_points_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_customer_points_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_customer_points_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE CASCADE
);

-- =========================================================================
-- 4. SERVICES & INVENTORY ITEMS
-- =========================================================================

CREATE TABLE sal_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100), -- 'dịch vụ', 'hóa chất', 'combo'
    price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    discount_price NUMERIC(15, 0) DEFAULT 0.00,
    duration INT, -- Duration in minutes
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_services_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_services_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL
);

CREATE TABLE sal_inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    name VARCHAR(255) NOT NULL,
    cost_price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    sell_price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    quantity INT DEFAULT 0,
    discount_price NUMERIC(15, 0) DEFAULT 0.00,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_inventories_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_inventories_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL
);

CREATE TABLE sal_service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    discount_price NUMERIC(15, 0) DEFAULT 0.00,
    duration INT, -- Expiration period in days
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_service_packages_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_service_packages_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL
);

-- Service Package Details (Normalized: 1 row per service in the package)
CREATE TABLE sal_service_package_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    service_package_id UUID NOT NULL,
    service_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_service_package_details_package FOREIGN KEY (service_package_id) REFERENCES sal_service_packages (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_service_package_details_service FOREIGN KEY (service_id) REFERENCES sal_services (id) ON DELETE CASCADE
);

CREATE TABLE sal_customer_purchased_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    customer_id UUID NOT NULL,
    service_package_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 0, -- Total sessions purchased
    used_quantity INT NOT NULL DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_purchased_pkgs_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_purchased_pkgs_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_purchased_pkgs_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_purchased_pkgs_package FOREIGN KEY (service_package_id) REFERENCES sal_service_packages (id) ON DELETE CASCADE
);

CREATE TABLE sal_package_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    customer_id UUID NOT NULL,
    package_id UUID NOT NULL,
    service_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_package_usage_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_package_usage_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_package_usage_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_package_usage_purchase FOREIGN KEY (package_id) REFERENCES sal_customer_purchased_packages (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_package_usage_service FOREIGN KEY (service_id) REFERENCES sal_services (id) ON DELETE CASCADE
);

-- =========================================================================
-- 5. APPOINTMENTS (BOOKINGS) & REVIEWS
-- =========================================================================

CREATE TABLE sal_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    customer_id UUID,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_bookings_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_bookings_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_bookings_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE SET NULL
);

CREATE TABLE sal_booking_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    booking_id UUID NOT NULL,
    service_id UUID NOT NULL,
    staff_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_booking_details_booking FOREIGN KEY (booking_id) REFERENCES sal_bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_booking_details_service FOREIGN KEY (service_id) REFERENCES sal_services (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_booking_details_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE SET NULL
);

CREATE TABLE sal_customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    customer_id UUID NOT NULL,
    booking_id UUID,
    rating_stars INT NOT NULL CHECK (
        rating_stars >= 1
        AND rating_stars <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_reviews_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_reviews_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_reviews_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_reviews_booking FOREIGN KEY (booking_id) REFERENCES sal_bookings (id) ON DELETE SET NULL
);

-- =========================================================================
-- 6. SALES & BILLING (INVOICES)
-- =========================================================================

CREATE TABLE sal_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    booking_id UUID,
    customer_id UUID,
    staff_id UUID, -- Cashier or receptionist who generated invoice
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'CASH', -- CASH, CREDIT, TRANSFER
    payment_status VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, PAID
    status VARCHAR(50) DEFAULT 'COMPLETED', -- DRAFT, COMPLETED, CANCELLED
    image_transaction TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_invoices_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_invoices_booking FOREIGN KEY (booking_id) REFERENCES sal_bookings (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_invoices_customer FOREIGN KEY (customer_id) REFERENCES sal_customers (id) ON DELETE SET NULL,
    CONSTRAINT fk_sal_invoices_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE SET NULL
);

CREATE TABLE sal_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    invoice_id UUID NOT NULL,
    staff_id UUID, -- Stylist / employee who performed service or sold product
    item_type VARCHAR(50) NOT NULL, -- 'service', 'product', 'package'
    item_id UUID NOT NULL, -- Polymorphic reference (service_id, inventory_id, or package_id)
    price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    employee_commission NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES sal_invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_invoice_items_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE SET NULL
);

-- =========================================================================
-- 7. COMMISSION CONFIGURATIONS
-- =========================================================================

CREATE TABLE sal_commission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., 'Cấu hình Thợ chính', 'Cấu hình Thợ phụ'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_comm_templates_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE
);

CREATE TABLE sal_commission_template_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    template_id UUID NOT NULL,
    apply_type VARCHAR(50) NOT NULL, -- 'category', 'service', 'product', 'package'
    target_id UUID, -- Nullable. References category, service_id, product_id, or package_id.
    commission_type VARCHAR(50) NOT NULL, -- 'percentage', 'flat'
    commission_value NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_comm_details_template FOREIGN KEY (template_id) REFERENCES sal_commission_templates (id) ON DELETE CASCADE
);

-- =========================================================================
-- 8. STAFF SCHEDULING, SHIFTS & WORK TURNS
-- =========================================================================

CREATE TABLE sal_employee_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    work_date DATE NOT NULL,
    shift_name VARCHAR(100),
    start_time TIME,
    end_time TIME,
    is_off BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_shifts_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_shifts_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_shifts_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

CREATE TABLE sal_employee_daily_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    work_date DATE NOT NULL,
    total_walkin_count INT DEFAULT 0,
    total_booked_count INT DEFAULT 0,
    total_customers_today INT DEFAULT 0,
    last_assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_turns_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_turns_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_turns_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

CREATE TABLE sal_employee_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    work_date DATE NOT NULL,
    check_in_at TIMESTAMP WITH TIME ZONE,
    check_out_at TIMESTAMP WITH TIME ZONE,
    work_status VARCHAR(50) DEFAULT 'PRESENT', -- 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'
    late_minutes INT DEFAULT 0,
    over_time_minutes INT DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_attendances_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_attendances_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_attendances_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

-- =========================================================================
-- 9. SALARY CONFIG & PAYROLLS
-- =========================================================================

CREATE TABLE sal_employee_salary_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    commission_template_id UUID,
    base_salary NUMERIC(15, 0) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_salary_cfg_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_salary_cfg_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_salary_cfg_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_salary_cfg_template FOREIGN KEY (commission_template_id) REFERENCES sal_commission_templates (id) ON DELETE SET NULL
);

CREATE TABLE sal_salary_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    advance_date DATE NOT NULL,
    amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'PAID'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_advances_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_advances_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_advances_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

CREATE TABLE sal_employee_monthly_payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    salary_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    base_salary NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    allowance NUMERIC(15, 0) DEFAULT 0.00,
    commission_amount NUMERIC(15, 0) DEFAULT 0.00,
    tip_amount NUMERIC(15, 0) DEFAULT 0.00,
    deduction_amount NUMERIC(15, 0) DEFAULT 0.00,
    final_salary NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'PAID'
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_payroll_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_payroll_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_payroll_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

-- =========================================================================
-- 10. REPORTING & EXPENSES
-- =========================================================================

CREATE TABLE sal_daily_revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    work_date DATE NOT NULL,
    total_revenue NUMERIC(15, 0) DEFAULT 0.00,
    total_cash NUMERIC(15, 0) DEFAULT 0.00,
    total_credit NUMERIC(15, 0) DEFAULT 0.00,
    total_transfer NUMERIC(15, 0) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_rev_reports_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_rev_reports_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE
);

CREATE TABLE sal_daily_employee_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    work_date DATE NOT NULL,
    total_revenue NUMERIC(15, 0) DEFAULT 0.00,
    total_bookings INT DEFAULT 0,
    total_customers INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_emp_rev_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_emp_rev_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_emp_rev_staff FOREIGN KEY (staff_id) REFERENCES sal_users (id) ON DELETE CASCADE
);

CREATE TABLE sal_daily_branch_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    work_date DATE NOT NULL,
    total_revenue NUMERIC(15, 0) DEFAULT 0.00,
    total_walkin_count INT DEFAULT 0,
    total_booked_count INT DEFAULT 0,
    total_customers_today INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_branch_rev_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_branch_rev_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE CASCADE
);

CREATE TABLE sal_revenue_expenditures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    tenant_id UUID NOT NULL,
    branch_id UUID, -- Nullable if generic tenant expense
    transaction_date DATE NOT NULL,
    revenue_expenditure_type VARCHAR(50) NOT NULL, -- 'income', 'expenditure'
    payment_type VARCHAR(50), -- 'cash', 'credit', 'transfer'
    category VARCHAR(100), -- 'rent', 'electricity', 'salary', 'inventory', 'marketing', 'other'
    amount NUMERIC(15, 0) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_sal_expenditures_tenant FOREIGN KEY (tenant_id) REFERENCES sal_tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sal_expenditures_branch FOREIGN KEY (branch_id) REFERENCES sal_branches (id) ON DELETE SET NULL
);

-- =========================================================================
-- 11. INDEXES FOR PERFORMANCE OPTIMIZATION (HIGHLY RECOMMENDED)
-- =========================================================================

-- Composite Indexes to speed up queries filtered by Tenant & Branch (prevents Full Table Scans)
CREATE INDEX idx_sal_branches_tenant ON sal_branches (tenant_id);

CREATE INDEX idx_sal_roles_tenant ON sal_roles (tenant_id);

CREATE INDEX idx_sal_users_tenant ON sal_users (tenant_id);

CREATE INDEX idx_sal_customers_tenant_branch ON sal_customers (tenant_id, branch_id);

CREATE INDEX idx_sal_services_tenant_branch ON sal_services (tenant_id, branch_id);

CREATE INDEX idx_sal_inventories_tenant_branch ON sal_inventories (tenant_id, branch_id);

CREATE INDEX idx_sal_service_packages_tenant_branch ON sal_service_packages (tenant_id, branch_id);

CREATE INDEX idx_sal_bookings_tenant_branch_time ON sal_bookings (
    tenant_id,
    branch_id,
    start_time
);

CREATE INDEX idx_sal_booking_details_booking ON sal_booking_details (booking_id);

CREATE INDEX idx_sal_invoices_tenant_branch_time ON sal_invoices (
    tenant_id,
    branch_id,
    created_at
);

CREATE INDEX idx_sal_invoice_items_invoice ON sal_invoice_items (invoice_id);

CREATE INDEX idx_sal_employee_shifts_date ON sal_employee_shifts (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_employee_attendances_date ON sal_employee_attendances (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_employee_daily_turns_date ON sal_employee_daily_turns (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_daily_revenue_reports_date ON sal_daily_revenue_reports (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_daily_employee_revenue_date ON sal_daily_employee_revenue (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_daily_branch_revenue_date ON sal_daily_branch_revenue (
    tenant_id,
    branch_id,
    work_date
);

CREATE INDEX idx_sal_revenue_expenditures_date ON sal_revenue_expenditures (
    tenant_id,
    branch_id,
    transaction_date
);

-- Partial Unique Indexes for soft delete support
CREATE UNIQUE INDEX uq_sal_users_email ON sal_users (email)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_customers_phone ON sal_customers (phone, tenant_id)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_customers_email ON sal_customers (email, tenant_id)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_permissions_slug ON sal_permissions (slug)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_user_branches_active ON sal_user_branches (user_id, branch_id)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_user_settings_user_active ON sal_user_settings (user_id)
WHERE
    deleted_at IS NULL;

CREATE UNIQUE INDEX uq_sal_service_package_details_active ON sal_service_package_details (
    service_package_id,
    service_id
)
WHERE
    deleted_at IS NULL;