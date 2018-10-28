const   router = require('express').Router();
const   csrfProtection = require('csurf')({ cookie:true });

router.get('/',csrfProtection, (req, res)=>{
    res.render('index', {title: "Chat App", csrf: req.csrfToken() });
});


module.exports = router;