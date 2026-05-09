const express        = require('express')
const router         = express.Router()
const verifyToken    = require('../middleware/verifyToken')
const verifyAdmin    = require('../middleware/verifyAdmin')
const studentController = require('../controllers/student.controller')

// All routes require auth
router.use(verifyToken)

router.get('/',         verifyAdmin, studentController.getAll)
router.get('/:id',      verifyAdmin, studentController.getOne)
router.post('/',        verifyAdmin, studentController.create)
router.put('/:id',      verifyAdmin, studentController.update)
router.delete('/:id',   verifyAdmin, studentController.remove)

module.exports = router