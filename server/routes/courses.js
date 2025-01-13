const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');

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

// @route   POST api/courses
// @desc    Create a new course
// @access  Private
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

// @route   GET api/courses
// @desc    Get all courses for a user
// @access  Private
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

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Private
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

// @route   PUT api/courses/:id
// @desc    Update course progress
// @access  Private
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

// @route   DELETE api/courses/:id
// @desc    Delete a course
// @access  Private
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