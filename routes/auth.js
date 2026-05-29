import express from 'express'; 
const router = express.Router(); 
router.get('/session', (req, res) =
    res.json({ success: true, user: null }); 
}); 
export default router; 
