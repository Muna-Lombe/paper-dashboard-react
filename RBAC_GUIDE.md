# Role-Based Access Control (RBAC) Guide

## Overview

Paper Dash API implements a hierarchical role-based access control system with three user roles:

- **Student** (Level 0): Basic access to courses and personal dashboard
- **Teacher** (Level 1): Can create and edit courses, view analytics
- **Admin** (Level 2): Full system access, user management, role assignment

## Architecture

### Components

1. **RBAC Middleware** (`src/middleware/rbac.ts`)
   - `authorize(roles)` - Route middleware to restrict access by role
   - `hasRole()` - Check if user has a specific role
   - `meetsRoleHierarchy()` - Verify role level requirements

2. **RBAC Service** (`src/services/rbacService.ts`)
   - User role management
   - Role updates and validation
   - Permission checking

3. **Admin Routes** (`src/routes/admin.ts`)
   - User management endpoints
   - Role assignment endpoints
   - Statistics and reporting

4. **Database Schema** (`drizzle/schema.ts`)
   - `users.role` - Enum field: `'student' | 'teacher' | 'admin'`
   - Default role: `'student'`

## Usage

### Protecting Routes with Authorization

```typescript
import { authorize } from '../middleware/rbac';

// Only admins can access
app.delete('/api/users/:id', auth, authorize(['admin']), handler);

// Admins and teachers can access
app.post('/api/courses', auth, authorize(['admin', 'teacher']), handler);

// Multiple roles
app.get(
  '/api/analytics',
  auth,
  authorize(['admin', 'teacher']),
  handler
);
```

### Checking Permissions in Route Handlers

```typescript
import { hasRole, hasAnyRole, meetsRoleHierarchy } from '../middleware/rbac';

app.post('/api/courses', auth, async (c) => {
  const user = c.get('user');

  // Check exact role
  if (hasRole(user, 'admin')) {
    // Admin-specific logic
  }

  // Check multiple roles
  if (hasAnyRole(user, ['admin', 'teacher'])) {
    // Teacher or admin logic
  }

  // Check hierarchy
  if (meetsRoleHierarchy(user.role, 'teacher')) {
    // Teacher or higher
  }
});
```

### Dynamic Permission Checking

```typescript
import { getRolesForAction } from '../middleware/rbac';

const allowedRoles = getRolesForAction('create_course');
// Returns: ['teacher', 'admin']
```

## Admin API Endpoints

### User Management

#### Get All Users with Optional Filtering

```bash
GET /api/admin/users?role=teacher&limit=50&offset=0
```

**Query Parameters:**
- `role` (optional): Filter by role (`student`, `teacher`, `admin`)
- `limit` (optional): Results per page (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "teacher",
      "isEmailVerified": true,
      "lastLoginAt": "2025-11-05T10:30:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 25 }
}
```

#### Get User Details

```bash
GET /api/admin/users/:userId
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "teacher",
    "createdAt": "2025-11-01T00:00:00Z",
    "lastLoginAt": "2025-11-05T10:30:00Z"
  }
}
```

#### Update User Role

```bash
POST /api/admin/users/:userId/role
Content-Type: application/json

{
  "newRole": "teacher"
}
```

**Response:**
```json
{
  "msg": "User role updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "teacher"
  }
}
```

#### Promote User

```bash
POST /api/admin/users/:userId/promote
Content-Type: application/json

{
  "targetRole": "teacher"
}
```

**Validation:**
- Target role must be higher than current role
- Cannot promote beyond admin
- Returns 500 if promotion violates hierarchy

#### Demote User

```bash
POST /api/admin/users/:userId/demote
Content-Type: application/json

{
  "targetRole": "student"
}
```

**Validation:**
- Target role must be lower than current role
- Cannot demote the last admin user
- Returns error if attempting self-demotion from admin

#### Get Role Statistics

```bash
GET /api/admin/stats/roles
```

**Response:**
```json
{
  "data": {
    "admin": 2,
    "teacher": 15,
    "student": 283
  },
  "total": 300
}
```

## JWT Token Structure

When a user logs in, the JWT payload includes their role:

```typescript
{
  user: {
    id: "uuid",
    email: "user@example.com",
    role: "teacher"  // Role included for RBAC checks
  }
}
```

## Role Hierarchy

The system implements a strict role hierarchy:

```
Admin (2)
  ↓
Teacher (1)
  ↓
Student (0)
```

### Hierarchy Rules

- Higher roles have all permissions of lower roles
- `meetsRoleHierarchy(userRole, requiredRole)` returns true if user is at or above required role
- Role 2 (admin) > Role 1 (teacher) > Role 0 (student)

## Default Permissions by Role

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| View Dashboard | ✓ | ✓ | ✓ |
| Create Course | ✗ | ✓ | ✓ |
| Edit Course | ✗ | ✓ | ✓ |
| View Analytics | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✓ |
| Assign Roles | ✗ | ✗ | ✓ |
| Delete Users | ✗ | ✗ | ✓ |

## Best Practices

### 1. Always Use Middleware First

```typescript
// ✓ GOOD
app.post('/api/courses', auth, authorize(['teacher', 'admin']), handler);

// ✗ BAD - Relying only on handler checks
app.post('/api/courses', auth, handler);
```

### 2. Log Role Changes

```typescript
// When updating roles, log the action
const logService = new LogHogClient(...);
await logService.info('User role changed', {
  category: 'admin_action',
  body: {
    targetUserId: userId,
    oldRole: previousRole,
    newRole: newRole,
    adminId: currentUser.id,
  },
});
```

### 3. Prevent Self-Demotion

```typescript
if (userId === currentUser.id && currentUser.role === 'admin' && newRole !== 'admin') {
  return c.json({ msg: 'Cannot demote yourself from admin' }, 403);
}
```

### 4. Protect Critical Operations

Always require admin role for:
- User deletion
- Role assignments
- System settings changes
- Sensitive data access

## Adding New Roles

To add a new role (e.g., "moderator"):

1. Update the schema enum:
```typescript
// drizzle/schema.ts
role: text('role', { enum: ['student', 'teacher', 'moderator', 'admin'] })
```

2. Update the RBAC types:
```typescript
// src/middleware/rbac.ts
export type UserRole = 'admin' | 'teacher' | 'moderator' | 'student';
```

3. Update hierarchy:
```typescript
const hierarchy: Record<UserRole, number> = {
  student: 0,
  moderator: 1,
  teacher: 2,
  admin: 3,
};
```

4. Create migration:
```sql
-- drizzle/0006_add_moderator_role.sql
ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('student', 'teacher', 'moderator', 'admin'));
```

## Troubleshooting

### "Insufficient permissions" Error

```json
{
  "msg": "Forbidden: Insufficient permissions",
  "requiredRoles": ["admin"],
  "userRole": "teacher"
}
```

**Solution:** Ensure user has required role before accessing protected endpoint.

### "Cannot demote the last admin" Error

**Solution:** Create another admin user before demoting the current one.

### Role Not Reflected in JWT

**Solution:** User needs to log out and log back in to get updated JWT with new role.

## Testing RBAC

```bash
# Test admin access
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://api.example.com/api/admin/users

# Test teacher access (should fail)
curl -H "Authorization: Bearer $TEACHER_TOKEN" https://api.example.com/api/admin/users

# Test role change
curl -X POST https://api.example.com/api/admin/users/:id/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newRole": "teacher"}'
```

## Security Considerations

1. **JWT Expiry**: Tokens expire after 5 days
2. **Role Verification**: Role is verified on every request via `auth` middleware
3. **Immutable Hierarchy**: Role hierarchy cannot be changed at runtime
4. **Admin Protection**: Last admin cannot be demoted
5. **Logging**: All role changes are logged via LogHog

## Migration Guide

If deploying RBAC to an existing database:

1. Run migration:
```bash
npm run migrate
```

2. All existing users will default to `'student'` role

3. Manually promote users to teacher/admin via API:
```bash
POST /api/admin/users/:userId/promote
```

4. Verify deployment:
```bash
curl https://api.example.com/api/admin/stats/roles
```

