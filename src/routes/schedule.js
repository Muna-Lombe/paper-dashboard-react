const auth = require('../middleware/auth'); // We'll use this later to protect routes
const Schedule = require('../models/Schedule'); // We'll need a Schedule model

const { Hono } = require('hono');
const { validator } = require('hono/validator');
const { z } = require('zod');

const scheduleRoutes = new Hono();

// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
// * @swagger
// * tags:
// *   name: Schedule
// *   description: User schedule management
// */

const scheduleDataSchema = z.object({
  lessonDays: z.record(z.array(z.number().int())).optional(),
  holidayDays: z.record(z.array(z.number().int())).optional(),
  holidayLessons: z.record(z.array(z.number().int())).optional(),
  selectedMonths: z.array(z.boolean()).optional(),
  selectAll: z.boolean().optional(),
  language: z.string().optional(),
});

// /**
// * @swagger
// * components:
// *   schemas:
// *     ScheduleData:
// *       type: object
// *       properties:
// *         lessonDays:
// *           type: object
// *           additionalProperties:
// *             type: array
// *             items:
// *               type: integer
// *           description: Object mapping month indices to arrays of lesson days
// *         holidayDays:
// *           type: object
// *           additionalProperties:
// *             type: array
// *             items:
// *               type: integer
// *           description: Object mapping month indices to arrays of holiday days
// *         holidayLessons:
// *           type: object
// *           additionalProperties:
// *             type: array
// *             items:
// *               type: integer
// *           description: Object mapping month indices to arrays of holiday lessons
// *         selectedMonths:
// *           type: array
// *           items:
// *             type: boolean
// *           description: Array indicating selected months
// *         selectAll:
// *           type: boolean
// *           description: Boolean indicating if all months are selected
// *         language:
// *           type: string
// *           description: The language of the schedule (e.g., "ru")
// *       example:
// *         lessonDays:
// *           "0": [1, 8, 15]
// *           "1": [6, 13, 20]
// *         holidayDays:
// *           "0": [28, 29, 30]
// *         holidayLessons:
// *           "0": [3, 10, 17]
// *         selectedMonths: [true, true, true, false, false, false, false, false, false]
// *         selectAll: true
// *         language: "ru"
// */

// /**
// * @swagger
// * /api/schedule:
// *   post:
// *     summary: Save a user's schedule configuration
// *     tags: [Schedule]
// *     security:
// *       - CookieAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             $ref: '#/components/schemas/ScheduleData'
// *     responses:
// *       200:
// *         description: Schedule configuration saved successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Schedule configuration saved successfully
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
scheduleRoutes.post('/',
  auth,
  validator("json", (value, c) => {
    const parsed = scheduleDataSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get('user'); // Get user ID from authenticated request
    const userId = user.id;
    const { lessonDays, holidayDays, holidayLessons, selectedMonths, selectAll, language } = c.req.valid("json");

    try {
      // Use upsert to create or update the schedule for the user
      const [schedule, created] = await Schedule.upsert({
        userId,
        lessonDays,
        holidayDays,
        holidayLessons,
        selectedMonths,
        selectAll,
        language,
      }, { returning: true });

      return c.json({ msg: 'Schedule configuration saved successfully', schedule });
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  }
);

// /**
// * @swagger
// * /api/schedule:
// *   get:
// *     summary: Retrieve a user's saved schedule configuration
// *     tags: [Schedule]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved schedule configuration
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 scheduleData:
// *                   $ref: '#/components/schemas/ScheduleData'
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: Schedule not found for user
// *       500:
// *         description: Server error
// */
scheduleRoutes.get('/', auth, async (c) => {
  try {
    const user = c.get('user');
    const userId = user.id;

    const schedule = await Schedule.findOne({ where: { userId } });
    
    if (!schedule) {
        return c.json({ msg: 'Schedule not found for user' }, 404);
    }

    return c.json({ scheduleData: schedule });
  } catch (err) {
    console.error(err.message);
    return c.json({ msg: "Server Error" }, 500);
  }
});

module.exports = scheduleRoutes;
