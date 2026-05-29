import express from 'express'; 
const router = express.Router(); 
router.get('/user/:userId', (req, res) =
    res.json({ success: true, enrollments: [] }); 
}); 
export default router; 
