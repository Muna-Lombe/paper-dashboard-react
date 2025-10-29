const auth = require('../middleware/auth');
// const multer = require('multer'); // Not compatible with Cloudflare Workers (file system ops)
// const { check, validationResult } = require('express-validator'); // Replaced with Hono validator
const Course = require('../models/Course'); // Import Course model
const CourseBlock = require('../models/CourseBlock'); // Import CourseBlock model
const CourseCorrection = require('../models/CourseCorrection'); // Import CourseCorrection model
// const User = require('../models/User'); // Not directly used in this file

const { Hono } = require('hono');
const { validator } = require('hono/validator');
const { z } = require('zod');

const courseRoutes = new Hono();

// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Course:
//  *       type: object
//  *       required:
//  *         - title
//  *         - description
//  *         - pdfUrl
//  *       properties:
//  *         id:
//  *           type: integer
//  *           description: The auto-generated id of the course
//  *         title:
//  *           type: string
//  *           description: The course title
//  *         description:
//  *           type: string
//  *           description: Course description
//  *         pdfUrl:
//  *           type: string
//  *           description: URL to the course PDF file
//  *         progress:
//  *           type: integer
//  *           minimum: 0
//  *           maximum: 100
//  *           description: Course completion progress
//  *         userId:
//  *           type: integer
//  *           description: ID of the user who owns the course
//  *         lastAccessed:
//  *           type: string
//  *           format: date-time
//  *           description: Last time the course was accessed
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *           description: When the course was created
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  *           description: When the course was last updated
//  * */

// Configure multer for PDF uploads (not compatible with Cloudflare Workers)
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'application/pdf') {
//             cb(null, true);
//         } else {
//             cb(new Error('Only PDF files are allowed!'), false);
//         }
//     }
// });

// /**
//  * @swagger
//  * /api/courses:
//  *   post:
//  *     summary: Create a new course
//  *     tags: [Courses]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - title
//  *               - description
//  *               - pdf
//  *             properties:
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               pdf:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Course created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Course'
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Not authorized
//  *       500:
//  *         description: Server error
//  * */
// router.post('/', [
// auth,
// upload.single('pdf'),
//     [
// check('title', 'Title is required').not().isEmpty(),
// check('description', 'Description is required').not().isEmpty()
//     ]
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
// return res.status(400).json({ errors: errors.array() });
//     }
//
//     try {
//         const course = await Course.create({
// title: req.body.title,
// description: req.body.description,
// pdfUrl: req.file ? `/uploads/${req.file.filename}` : null,
// userId: req.user.id
//         });
//
// res.json(course);
//     } catch (err) {
// console.error(err.message);
// res.status(500).send('Server Error');
//     }
// });

const createCourseSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  // For file uploads, a different strategy is needed for Workers.
  // For now, we will expect a pdfUrl or handle file upload via a separate service.
  pdfUrl: z.string().optional(),
});

courseRoutes.post(
  '/',
  auth,
  validator("json", (value, c) => {
    const parsed = createCourseSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { title, description, pdfUrl } = c.req.valid("json");
    const user = c.get('user'); // Get user from Hono context

    try {
      const course = await Course.create({
        title,
        description,
        pdfUrl: pdfUrl || null, // Assuming pdfUrl is provided in the body or handled externally
        userId: user.id,
      });

      return c.json(course);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses for authenticated user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
courseRoutes.get('/', auth, async (c) => {
    try {
        const user = c.get('user');
        const courses = await Course.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });
        return c.json(courses);
    } catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
courseRoutes.get('/:id', auth, async (c) => {
    try {
        const user = c.get('user');
        const courseId = c.req.param('id');
        const course = await Course.findOne({
            where: {
                id: courseId,
                userId: user.id
            }
        });
        
        if (!course) {
            return c.json({ msg: 'Course not found' }, 404);
        }

        return c.json(course);
    } catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});

const updateCourseProgressSchema = z.object({
  progress: z.number().int().min(0).max(100, "Progress must be between 0 and 100"),
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course progress
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid progress value
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
courseRoutes.put('/:id', 
  auth,
  validator("json", (value, c) => {
    const parsed = updateCourseProgressSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get('user');
    const courseId = c.req.param('id');
    const { progress } = c.req.valid("json");

    try {
        const course = await Course.findOne({
            where: {
                id: courseId,
                userId: user.id
            }
        });
        
        if (!course) {
            return c.json({ msg: 'Course not found' }, 404);
        }

        course.progress = progress;
        course.lastAccessed = new Date();
        await course.save();

        return c.json(course);
    } catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
courseRoutes.delete('/:id', auth, async (c) => {
    try {
        const user = c.get('user');
        const courseId = c.req.param('id');
        const course = await Course.findOne({
            where: {
                id: courseId,
                userId: user.id
            }
        });
        
        if (!course) {
            return c.json({ msg: 'Course not found' }, 404);
        }

        await course.destroy();
        return c.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});

const createCourseBlockSchema = z.object({
  type: z.enum(["text", "image", "video", "quiz"]),
  content: z.string().nonempty("Content is required"),
  order: z.number().int().min(0),
});

/**
 * @swagger
 * /api/courses/{courseId}/blocks:
 *   post:
 *     summary: Add new content blocks to a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course to add blocks to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *               - order
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["text", "image", "video", "quiz"]
 *                 description: The type of the content block
 *               content:
 *                 type: string
 *                 description: The content of the block (e.g., text, image URL, video URL, quiz data)
 *               order:
 *                 type: integer
 *                 description: The order of the block within the course
 *     responses:
 *       201:
 *         description: Content block added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Content block added successfully
 *                 block:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     content:
 *                       type: string
 *                     order:
 *                       type: integer
 *       400:
 *         description: Invalid input or course not found
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
courseRoutes.post(
  '/:courseId/blocks',
  auth,
  validator("json", (value, c) => {
    const parsed = createCourseBlockSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { courseId } = c.req.param();
    const { type, content, order } = c.req.valid("json");
    const user = c.get('user');

    try {
      const course = await Course.findOne({
        where: {
          id: courseId,
          userId: user.id,
        },
      });

      if (!course) {
        return c.json({ msg: 'Course not found' }, 404);
      }

      const newBlock = await CourseBlock.create({
        courseId,
        type,
        content,
        order,
      });

      return c.json({ msg: 'Content block added successfully', block: newBlock }, 201);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

const updateCourseBlockSchema = z.object({
  type: z.enum(["text", "image", "video", "quiz"]).optional(),
  content: z.string().nonempty("Content is required").optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * @swagger
 * /api/courses/{courseId}/blocks/{blockId}:
 *   put:
 *     summary: Update a specific content block within a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the content block to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["text", "image", "video", "quiz"]
 *                 description: The new type of the content block
 *               content:
 *                 type: string
 *                 description: The new content of the block
 *               order:
 *                 type: integer
 *                 description: The new order of the block
 *     responses:
 *       200:
 *         description: Content block updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Content block updated successfully
 *                 block:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     content:
 *                       type: string
 *                     order:
 *                       type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course or content block not found
 *       500:
 *         description: Server error
 */
courseRoutes.put(
  '/:courseId/blocks/:blockId',
  auth,
  validator("json", (value, c) => {
    const parsed = updateCourseBlockSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get('user');
    const { courseId, blockId } = c.req.param();
    const { type, content, order } = c.req.valid("json");

    try {
      const course = await Course.findOne({
        where: {
          id: courseId,
          userId: user.id,
        },
      });

      if (!course) {
        return c.json({ msg: 'Course not found' }, 404);
      }

      const block = await CourseBlock.findOne({
        where: {
          id: blockId,
          courseId: courseId,
        },
      });

      if (!block) {
        return c.json({ msg: 'Content block not found' }, 404);
      }

      block.type = type || block.type;
      block.content = content || block.content;
      block.order = order || block.order;
      await block.save();

      return c.json({ msg: 'Content block updated successfully', block });
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

/**
 * @swagger
 * /api/courses/{courseId}/blocks/{blockId}:
 *   delete:
 *     summary: Delete a specific content block
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the content block to delete
 *     responses:
 *       200:
 *         description: Content block deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Content block deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course or content block not found
 *       500:
 *         description: Server error
 */
courseRoutes.delete('/:courseId/blocks/:blockId', auth, async (c) => {
  const { courseId, blockId } = c.req.param();
  const user = c.get('user');

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: user.id,
      },
    });

    if (!course) {
      return c.json({ msg: 'Course not found' }, 404);
    }

    const block = await CourseBlock.findOne({
      where: {
        id: blockId,
        courseId: courseId,
      },
    });

    if (!block) {
      return c.json({ msg: 'Content block not found' }, 404);
    }

    await block.destroy();
    return c.json({ msg: 'Content block deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return c.json({ msg: "Server Error" }, 500);
  }
});

const createCorrectionSchema = z.object({
  blockId: z.number().int().optional(),
  correctionText: z.string().nonempty("Correction text is required"),
});

/**
 * @swagger
 * /api/courses/{courseId}/corrections:
 *   post:
 *     summary: Add corrections or annotations to course content
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course to add corrections to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correctionText
 *             properties:
 *               blockId:
 *                 type: integer
 *                 description: Optional. The ID of the specific content block the correction applies to.
 *               correctionText:
 *                 type: string
 *                 description: The text of the correction or annotation.
 *     responses:
 *       201:
 *         description: Correction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Correction added successfully
 *                 correction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     courseId:
 *                       type: integer
 *                     blockId:
 *                       type: integer
 *                     correctionText:
 *                       type: string
 *       400:
 *         description: Invalid input or course not found
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
courseRoutes.post(
  '/:courseId/corrections',
  auth,
  validator("json", (value, c) => {
    const parsed = createCorrectionSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { courseId } = c.req.param();
    const { blockId, correctionText } = c.req.valid("json");
    const user = c.get('user');

    try {
      const course = await Course.findOne({
        where: {
          id: courseId,
          userId: user.id,
        },
      });

      if (!course) {
        return c.json({ msg: 'Course not found' }, 404);
      }

      const newCorrection = await CourseCorrection.create({
        courseId,
        blockId,
        correctionText,
      });

      return c.json({ msg: 'Correction added successfully', correction: newCorrection }, 201);
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

const updateCorrectionSchema = z.object({
  blockId: z.number().int().optional(),
  correctionText: z.string().nonempty("Correction text is required").optional(),
});

/**
 * @swagger
 * /api/courses/{courseId}/corrections/{correctionId}:
 *   put:
 *     summary: Update a specific correction
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course
 *       - in: path
 *         name: correctionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the correction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correctionText:
 *                 type: string
 *                 description: The new text of the correction or annotation.
 *               blockId:
 *                 type: integer
 *                 description: Optional. The new ID of the specific content block the correction applies to.
 *     responses:
 *       200:
 *         description: Correction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Correction updated successfully
 *                 correction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     correctionText:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course or correction not found
 *       500:
 *         description: Server error
 */
courseRoutes.put(
  '/:courseId/corrections/:correctionId',
  auth,
  validator("json", (value, c) => {
    const parsed = updateCorrectionSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get('user');
    const { courseId, correctionId } = c.req.param();
    const { blockId, correctionText } = c.req.valid("json");

    try {
      const course = await Course.findOne({
        where: {
          id: courseId,
          userId: user.id,
        },
      });

      if (!course) {
        return c.json({ msg: 'Course not found' }, 404);
      }

      const correction = await CourseCorrection.findOne({
        where: {
          id: correctionId,
          courseId: courseId,
        },
      });

      if (!correction) {
        return c.json({ msg: 'Correction not found' }, 404);
      }

      correction.correctionText = correctionText || correction.correctionText;
      correction.blockId = blockId || correction.blockId;
      await correction.save();

      return c.json({ msg: 'Correction updated successfully', correction });
    } catch (err) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

/**
 * @swagger
 * /api/courses/{courseId}/corrections/{correctionId}:
 *   delete:
 *     summary: Delete a specific correction
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course
 *       - in: path
 *         name: correctionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the correction to delete
 *     responses:
 *       200:
 *         description: Correction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Correction deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Course or correction not found
 *       500:
 *         description: Server error
 */
courseRoutes.delete('/:courseId/corrections/:correctionId', auth, async (c) => {
  const { courseId, correctionId } = c.req.param();
  const user = c.get('user');

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: user.id,
      },
    });

    if (!course) {
      return c.json({ msg: 'Course not found' }, 404);
    }

    const correction = await CourseCorrection.findOne({
      where: {
        id: correctionId,
        courseId: courseId,
      },
    });

    if (!correction) {
      return c.json({ msg: 'Correction not found' }, 404);
    }

    await correction.destroy();
    return c.json({ msg: 'Correction deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return c.json({ msg: "Server Error" }, 500);
  }
});

module.exports = courseRoutes; 