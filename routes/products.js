const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";
const db = require("../db/mysql_connection");


async function orderDetailDelete(productId) {
    const ordersDetail = await db.sequelize.query(`
        SELECT od.id 
        FROM order_detail od
        INNER JOIN orders o ON o.id=od.id_order
        WHERE o.id_order_status = 1 AND od.id_product = '${productId}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => (result));
    return ordersDetail;
}

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

async function productExist(producId){
    const user = db.sequelize.query(`
        SELECT *
        FROM products
        WHERE id = '${producId}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => (result));
    return user;
}

router.get('/', (req, res) => {
    db.sequelize.query(`
        SELECT 
            p.product_name,
            p.description,
            p.photo,
            p.price,
            p.stock,
            ep.description 
        FROM products p 
        INNER JOIN products_status ep ON p.id_status = ep.id`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => res.status(200).json(result));
})

router.get('/:id', async (req , res) => {
    const idParams = req.params.id;
    const product = await db.sequelize.query(`
        SELECT 
            p.product_name,
            p.description,
            p.photo,
            p.price,
            p.stock,
            ep.description 
        FROM products p
        INNER JOIN products_status ep ON p.id_status = ep.id
        WHERE p.id = ${idParams}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => result);

    if (product.length != 0) {
        res.status(200).json(product);
    } else {
        res.status(404).json("Producto no encontrado");
    }
})

router.post('/', authenticateUser, (req, res) => {
    const data = req.body;
    const idStatus = "1";
    const entryDate = moment().format("YYYY-MM-DD");
    const modificationDate = moment().format("YYYY-MM-DD");

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(404).json('No esta autorizado a crear un producto');
        } else {
            db.query(`
                INSERT INTO products(
                    product_name,
                    description,
                    photo,
                    price,
                    stock,
                    entry_date,
                    modification_date,
                    id_status
                )
                VALUES(
                    '${data.product}',
                    '${data.description}',
                    '${data.photo}',
                    '${data.price}',
                    '${data.stock}',
                    '${entryDate}',
                    '${modificationDate}',
                    '${idStatus}'
                )
            `);
            res.status(201).json(`Producto agregado correctamente`);
        }
    })
})

router.put('/:id' , authenticateUser, (req , res) => {
    const newData = req.body;
    const modificationDate = moment().format("YYYY-MM-DD");
    const idParams = req.params.id;

    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(401).json('No esta autorizado a crear un producto');
        } else {
            const productExistFn = await productExist(idParams);
            if (productExistFn.length != 0) {
                db.query(`
                    UPDATE products
                    SET product_name = '${newData.product}',
                        description = '${newData.description}',
                        photo = '${newData.photo}',
                        stock = '${newData.stock}',
                        modification_date = '${modificationDate}',
                        id_status= '${newData.idStatus}'
                    WHERE id='${idParams}'
                `);
                res.status(200).json(`El producto fue modificado correctamente`);
            } else {
                res.status(404).json(`El producto indicado no existe`);
            }
        }
    })
})

//ELIMINAR PRODUCTO
router.delete('/:id', authenticateUser, (req, res) => {
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '3') {

            const idParams = req.params.id;
            const product = await productExist(idParams);
            console.log(product.length);
            if (product.length != 0) {
                const odDelete = await orderDetailDelete(idParams);
                console.log(odDelete);
                db.query(`
                    DELETE FROM products
                    WHERE id='${idParams}'
                `);
                odDelete.forEach(element => {
                    db.query(`
                        DELETE FROM order_detail
                        WHERE id='${element.id}'
                    `);
                });

                res.status(200).json(`El producto fue eliminado correctamente`);
            } else {
                res.status(500).json(`El producto indicado no existe`);
            }
        } else {
            res.status(401).json('No esta autorizado a realizar esta acción');
        }
    })
})



module.exports = router;