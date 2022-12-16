const express = require('express');
const controllers=require('../controllers/controllers');
const router = express.Router();

router.get('/mail/user/:email',controllers.getUser)
router.get('/mail/send',controllers.sendMail);
router.get('/mail/drafts/:email', controllers.getDrafts);
router.get('/mail/read/:messageId', controllers.readMail);
router.get('/mail/reads/:email', controllers.readAllMessages);
router.get('/mail/reads/:email/:messageId/:attachId', controllers.getAttachmetns)

// router.post('/print', )
// 185068dd79e077c6
module.exports = router;