const   router = require('express').Router();

router.get('/', (req, res)=>{
    res.render('index', {title: "Chat App"});
});


module.exports = router;