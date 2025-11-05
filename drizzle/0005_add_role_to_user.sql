-- Add role field to users table for RBAC
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin'));

