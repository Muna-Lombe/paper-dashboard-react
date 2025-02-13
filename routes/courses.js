const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const Course = require('../models/Course');
// const User = require('../models/User');

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
            pdfUrl: req.file.path,
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

module.exports = router; 