const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";
const db = require("../db/mysql_connection");

//ADMIN para ver todos los usuarios creados.
router.get('/', (req, res) => {
    
    db.sequelize.query(`SELECT p.product_name, p.description, p.photo, p.price, p.stock, ep.description 
                            FROM products p
                            INNER JOIN products_status ep ON p.id_status = ep.id`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => res.json(result));
})

router.get('/:id' , (req , res) => {

    const idParams = req.params.id;
    db.sequelize.query(`SELECT p.product_name, p.description, p.photo, p.price, p.stock, ep.description 
                        FROM products p
                        INNER JOIN products_status ep ON p.id_status = ep.id
                        WHERE p.id = ${idParams}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => res.json(result));
})

function authenticateUser(req, res, next) {
    try {
        const bearerHeader = req.headers['authorization'];
        console.log(`bearerheader ${bearerHeader}`)
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(" ")[1];
            req.token = bearerToken;
            next();
        } else {
            res.status(401).json({error: 'Error en verificar el token'})
        }

    } catch {
        res.json({ error: 'Error al validar usuario' })
    }
}
router.post('/', authenticateUser, (req, res) => {
    const { product, description, photo, price, stock } = req.body;
    const data = req.body;
    const idStatus = "1";
    const entryDate = moment().format("YYYY-MM-DD");
    const modificationDate = moment().format("YYYY-MM-DD");

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(401).json('No esta autorizado a crear un producto');
        } else {
            const addProduct = db.query(`INSERT INTO products(product_name, description, photo, price, stock, entry_date, modification_date, id_status) VALUES('${data.product}', '${data.description}', '${data.photo}', '${data.price}', '${data.stock}', '${entryDate}', '${modificationDate}', '${idStatus}')`);
            res.status(201).json(`Producto agregado correctamente`);
            // console.log(addProduct);
        }
    })
})

router.put('/:id' , authenticateUser, (req , res) => {
    const { product, description, photo, price, stock, idStatus } = req.body;
    const newData = req.body;
    const modificationDate = moment().format("YYYY-MM-DD");

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(401).json('No esta autorizado a crear un producto');
        } else {
            const updateProduct = db.query(`UPDATE products SET product_name = '${newData.product}', description = '${newData.description}',photo = '${newData.photo}',
                        stock = '${newData.stock}', modification_date = '${modificationDate}', id_status= '${newData.idStatus}'
                        WHERE id='${idParams.id}'`);
        res.json(`El producto fue modificado correctamente y agregado a la DB ${newData.product}`)
        }
    })
})

router.delete('/:id', authenticateUser, (req, res) => {

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '3') {
            const idParams = req.params.id;
            // console.log(idParams);
            const deleteProduct = db.query(`DELETE FROM products
                    WHERE id='${idParams}'`);
                    //CORREGIR ESTO PARA QUE SI EL ID_ORDER_STATUS ES = 1 ELIMINAR ESE ID ORDER
                    // db.query(`DELETE FROM order_detail od 
                    // INNER JOIN orders o ON o.id = od.id_order 
                    // WHERE id_product= ${idParams} AND o.id_order_status=1`)
            res.json(`El producto fue eliminado correctamente`)
            
        } else {
            res.status(401).json('No esta autorizado a realizar esta accion');
        }
    })
})

module.exports = router;