import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { users, courses } from '../../drizzle/schema'; // Import Drizzle schemas
import { sql } from 'drizzle-orm';
const dashboardRoutes = new Hono();
// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
// * @swagger
// * /api/dashboard/summary:
// *   get:
// *     summary: Fetch overall statistics for the dashboard
// *     tags: [Dashboard]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved dashboard summary
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 totalUsers:
// *                   type: integer
// *                   example: 120
// *                 totalCourses:
// *                   type: integer
// *                   example: 50
// *                 activeUsers:
// *                   type: integer
// *                   example: 35
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
dashboardRoutes.get('/summary', auth, async (c) => {
    try {
        const db = c.env.drizzleDb;
        const totalUsersResult = await db.select({ count: sql `count(*)` }).from(users);
        const totalCoursesResult = await db.select({ count: sql `count(*)` }).from(courses);
        // Placeholder for active users - requires more complex logic (e.g., last login, activity)
        const activeUsers = 0;
        const totalUsers = totalUsersResult[0].count;
        const totalCourses = totalCoursesResult[0].count;
        return c.json({
            totalUsers,
            totalCourses,
            activeUsers,
            // ... other statistics
        });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
// module.exports = router; // Removed Express router export
// /**
// * @swagger
// * /api/dashboard/calendar-events:
// *   get:
// *     summary: Retrieve calendar events for display on the dashboard
// *     tags: [Dashboard]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved calendar events
// *         content:
// *           application/json:
// *             schema:
// *               type: array
// *               items:
// *                 type: object
// *                 properties:
// *                   id:
// *                     type: integer
// *                     example: 1
// *                   title:
// *                     type: string
// *                     example: "Meeting with John"
// *                   start:
// *                     type: string
// *                     format: date-time
// *                     example: "2025-10-26T10:00:00Z"
// *                   end:
// *                     type: string
// *                     format: date-time
// *                     example: "2025-10-26T11:00:00Z"
// *                   allDay:
// *                     type: boolean
// *                     example: false
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
dashboardRoutes.get('/calendar-events', auth, async (c) => {
    try {
        // Placeholder for fetching calendar events
        const calendarEvents = [
            {
                id: 1,
                title: 'Meeting with John',
                start: '2025-10-26T10:00:00Z',
                end: '2025-10-26T11:00:00Z',
                allDay: false,
            },
            {
                id: 2,
                title: 'Project Deadline',
                start: '2025-10-28T23:59:59Z',
                end: '2025-10-28T23:59:59Z',
                allDay: true,
            },
        ];
        return c.json(calendarEvents);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
// /**
// * @swagger
// * /api/dashboard/student-requests:
// *   get:
// *     summary: Fetch a list of pending student requests
// *     tags: [Dashboard]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved student requests
// *         content:
// *           application/json:
// *             schema:
// *               type: array
// *               items:
// *                 type: object
// *                 properties:
// *                   id:
// *                     type: integer
// *                     example: 1
// *                   studentName:
// *                     type: string
// *                     example: "Alice Smith"
// *                   courseName:
// *                     type: string
// *                     example: "Introduction to React"
// *                   requestDate:
// *                     type: string
// *                     format: date-time
// *                     example: "2025-10-25T14:30:00Z"
// *                   status:
// *                     type: string
// *                     example: "pending"
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
dashboardRoutes.get('/student-requests', auth, async (c) => {
    try {
        // Placeholder for fetching student requests
        const studentRequests = [
            {
                id: 1,
                studentName: 'Alice Smith',
                courseName: 'Introduction to React',
                requestDate: '2025-10-25T14:30:00Z',
                status: 'pending',
            },
            {
                id: 2,
                studentName: 'Bob Johnson',
                courseName: 'Advanced Node.js',
                requestDate: '2025-10-24T10:00:00Z',
                status: 'pending',
            },
        ];
        return c.json(studentRequests);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
// /**
// * @swagger
// * /api/dashboard/student-requests/{id}/approve:
// *   post:
// *     summary: Approve a specific student request
// *     tags: [Dashboard]
// *     security:
// *       - CookieAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         schema:
// *           type: integer
// *         required: true
// *         description: The ID of the student request to approve
// *     responses:
// *       200:
// *         description: Student request approved successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Student request approved successfully
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: Student request not found
// *       500:
// *         description: Server error
// */
dashboardRoutes.post('/student-requests/:id/approve', auth, async (c) => {
    try {
        const { id } = c.req.param();
        // Placeholder for approving a student request
        console.log(`Approving student request with ID: ${id}`);
        return c.json({ msg: `Student request ${id} approved successfully` });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
// /**
// * @swagger
// * /api/dashboard/student-requests/{id}/reject:
// *   post:
// *     summary: Reject a specific student request
// *     tags: [Dashboard]
// *     security:
// *       - CookieAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         schema:
// *           type: integer
// *         required: true
// *         description: The ID of the student request to reject
// *     responses:
// *       200:
// *         description: Student request rejected successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Student request rejected successfully
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: Student request not found
// *       500:
// *         description: Server error
// */
dashboardRoutes.post('/student-requests/:id/reject', auth, async (c) => {
    try {
        const { id } = c.req.param();
        // Placeholder for rejecting a student request
        console.log(`Rejecting student request with ID: ${id}`);
        return c.json({ msg: `Student request ${id} rejected successfully` });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
export default dashboardRoutes;
