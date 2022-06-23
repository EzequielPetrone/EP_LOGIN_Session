//Importo y configuro el router
const express = require('express')
const router = express.Router()

//Para poder leer bien los req.body
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// INDEX
router.get('/', async (req, res) => {
    if (req.session.logged) {
        // res.render('main', { username: req.session.user, productos: await contenedorProd.getAll() })
        res.render('main', { username: req.session.user })
    } else {
        res.redirect('/login');
    }
});

// get LOGIN
router.get('/login', (req, res) => {
    if (req.session.logged) {
        res.redirect('/')
    } else {
        res.render('login');
    }
});

// post LOGIN
router.post('/login', (req, res) => {
    const { username, password } = req.body
    if (username && password) {
        req.session.user = username
        req.session.logged = true
        res.redirect('/')
    }
});

// LOGOUT
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (!err) {
            res.render('logout');
        } else {
            res.redirect('/');
        }
    });
});

/*
// Post Productos
router.post('/productos', async (req, res) => {
    const { productTitle, productPrice, productImgUrl } = req.body
    if (req.session.logged && productTitle && productPrice && productImgUrl) {
        await contenedorProd.saveProducto({
            title: productTitle,
            price: parseFloat(productPrice),
            thumbnail: productImgUrl
        })
    }
    res.redirect('/')
});
*/

//Gestiono rutas no parametrizadas
router.use('*', (req, res) => {
    res.status(404).render('routing-error', { originalUrl: req.originalUrl, method: req.method })
});

module.exports = router 
