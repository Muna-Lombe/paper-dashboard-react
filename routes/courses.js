const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const Course = require('../models/Course'); // Import Course model
const CourseBlock = require('../models/CourseBlock'); // Import CourseBlock model
const CourseCorrection = require('../models/CourseCorrection'); // Import CourseCorrection model
// const User = require('../models/User'); // Not directly used in this file

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - pdfUrl
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the course
 *         title:
 *           type: string
 *           description: The course title
 *         description:
 *           type: string
 *           description: Course description
 *         pdfUrl:
 *           type: string
 *           description: URL to the course PDF file
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Course completion progress
 *         userId:
 *           type: integer
 *           description: ID of the user who owns the course
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           description: Last time the course was accessed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the course was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the course was last updated
 */

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - pdf
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/', [
    auth,
    upload.single('pdf'),
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const course = await Course.create({
            title: req.body.title,
            description: req.body.description,
            pdfUrl: req.file ? `/uploads/${req.file.filename}` : null,
            userId: req.user.id
        });

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
router.get('/', auth, async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
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
router.put('/:id', [
    auth,
    check('progress', 'Progress must be between 0 and 100').isFloat({ min: 0, max: 100 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        course.progress = req.body.progress;
        course.lastAccessed = Date.now();
        await course.save();

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
router.delete('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        await course.destroy();
        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
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
router.post('/:courseId/blocks', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId } = req.params;
  const { type, content, order } = req.body;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const newBlock = await CourseBlock.create({
      courseId,
      type,
      content,
      order,
    });

    res.status(201).json({ msg: 'Content block added successfully', block: newBlock });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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
router.put('/:courseId/blocks/:blockId', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId, blockId } = req.params;
  const { type, content, order } = req.body;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const block = await CourseBlock.findOne({
      where: {
        id: blockId,
        courseId: courseId,
      },
    });

    if (!block) {
      return res.status(404).json({ msg: 'Content block not found' });
    }

    block.type = type || block.type;
    block.content = content || block.content;
    block.order = order || block.order;
    await block.save();

    res.json({ msg: 'Content block updated successfully', block });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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
router.delete('/:courseId/blocks/:blockId', auth, async (req, res) => {
  const { courseId, blockId } = req.params;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const block = await CourseBlock.findOne({
      where: {
        id: blockId,
        courseId: courseId,
      },
    });

    if (!block) {
      return res.status(404).json({ msg: 'Content block not found' });
    }

    await block.destroy();
    res.json({ msg: 'Content block deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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
router.post('/:courseId/corrections', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId } = req.params;
  const { blockId, correctionText } = req.body;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const newCorrection = await CourseCorrection.create({
      courseId,
      blockId,
      correctionText,
      // You might want to add req.user.id here for who made the correction
    });

    res.status(201).json({ msg: 'Correction added successfully', correction: newCorrection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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
router.put('/:courseId/corrections/:correctionId', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId, correctionId } = req.params;
  const { blockId, correctionText } = req.body;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const correction = await CourseCorrection.findOne({
      where: {
        id: correctionId,
        courseId: courseId,
      },
    });

    if (!correction) {
      return res.status(404).json({ msg: 'Correction not found' });
    }

    correction.correctionText = correctionText || correction.correctionText;
    correction.blockId = blockId || correction.blockId;
    await correction.save();

    res.json({ msg: 'Correction updated successfully', correction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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
router.delete('/:courseId/corrections/:correctionId', auth, async (req, res) => {
  const { courseId, correctionId } = req.params;

  try {
    const course = await Course.findOne({
      where: {
        id: courseId,
        userId: req.user.id,
      },
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const correction = await CourseCorrection.findOne({
      where: {
        id: correctionId,
        courseId: courseId,
      },
    });

    if (!correction) {
      return res.status(404).json({ msg: 'Correction not found' });
    }

    await correction.destroy();
    res.json({ msg: 'Correction deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 