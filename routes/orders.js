const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const privateKey = "112358";
const db = require("../db/mysql_connection");
const Sequelize = require('sequelize');

function authenticateUser(req, res, next) {
    try {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(" ")[1];
            req.token = bearerToken;
            next();
        } else {
            res.status(401).json({ error: 'Error en verificar el token' })
        }

    } catch {
        res.json({ error: 'Error al validar usuario' })
    }
}

router.get('/', authenticateUser, (req, res) => {

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == '3') {
            res.status(401).json('No esta autorizado a realizar la consulta');
        } else if (authData.role == '1') {
            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, od.quantity o.total_order
                        FROM users u
                        INNER JOIN orders o ON o.id_client = u.id
                        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
                        INNER JOIN orders_status os ON os.id = o.id_order_status
                        INNER JOIN order_detail od ON od.id_order = o.id
                        INNER JOIN products p ON p.id = od.id_product`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    // logging: console.log
                }
            ).then(result => res.json(result));
        } else {
            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, o.total_order
                        FROM users u
                        INNER JOIN orders o ON o.id_client = u.id
                        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
                        INNER JOIN orders_status os ON os.id = o.id_order_status
                        INNER JOIN order_detail od ON od.id_order = o.id
                        INNER JOIN products p ON p.id = od.id_product
                        WHERE o.id_order_status <> '1'`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    // logging: console.log
                }
            ).then(result => res.json(result));
        }
    });
})

router.get('/:id', authenticateUser, (req, res) => {

    jwt.verify(req.token, privateKey, (error, authData) => {
        const idParams = req.params;
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            if (authData.userId == idParams.id) {
                db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, od.quantity o.total_order
                        FROM users u
                        INNER JOIN orders o ON o.id_client = u.id
                        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
                        INNER JOIN orders_status os ON os.id = o.id_order_status
                        INNER JOIN order_detail od ON od.id_order = o.id
                        INNER JOIN products p ON p.id = od.id_product
                        WHERE u.id = ${idParams.id}`,
                    {
                        type: db.Sequelize.QueryTypes.SELECT,
                        raw: true,
                        plain: false,
                        // logging: console.log
                    }
                ).then(result => res.json(result));
            } else {

                res.status(401).json('Su usuario no está autorizado para ver las ordenes de otro usuario');

            }
        } else if (authData.role == 1) {
            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, od.quantity o.total_order
                        FROM users u
                        INNER JOIN orders o ON o.id_client = u.id
                        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
                        INNER JOIN orders_status os ON os.id = o.id_order_status
                        INNER JOIN order_detail od ON od.id_order = o.id
                        INNER JOIN products p ON p.id = od.id_product
                        WHERE u.id = ${idParams.id}`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    // logging: console.log
                }
            ).then(result => res.json(result));
        } else {
            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, o.total_order
                        FROM users u
                        INNER JOIN orders o ON o.id_client = u.id
                        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
                        INNER JOIN orders_status os ON os.id = o.id_order_status
                        INNER JOIN order_detail od ON od.id_order = o.id
                        INNER JOIN products p ON p.id = od.id_product
                        WHERE u.id = ${idParams.id} 
                        AND o.id_order_status <> '1'`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    // logging: console.log
                }
            ).then(result => res.json(result));
        }
    });
})

router.post('/', authenticateUser, async (req, res) => {
    const { productId, quantity } = req.body;
    const dateOrder = moment().format("YYYY-MM-DD");
    const dateOrder_mod = moment().format("YYYY-MM-DD");
    const paymentMethod = "1"
    const orderStatus = "1";
    let totalPedido = "0";

    // BUSCO EL ID DEL PRODUCTO SELECCIONADO
    // const product = await db.sequelize.query(`
    //     SELECT *
    //     FROM products p
    //     WHERE product_name = '${productName}'`,
    //     {
    //         type: db.Sequelize.QueryTypes.SELECT,
    //         raw: true,
    //         plain: false,
    //         // logging: console.log
    //     }
    // ).then(result => result);

    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else {
            // CREAR DETAIL ORDER

            // BUSCO ID DE ORDEN CON STATUS "NUEVA"
            const registeredOrder = await db.sequelize.query(`
                SELECT *
                FROM orders o
                WHERE id_client = ${authData.userId}
                AND id_order_status = "1"`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    // logging: console.log
                }
            ).then(result => result);

            if (registeredOrder.length != 0) {

                const isProduct = await db.sequelize.query(`
                SELECT od.quantity 
                FROM order_detail od
                WHERE od.id_product = '${productId}'
                AND od.id_order = '${registeredOrder[0].id}'`,
                    {
                        type: db.Sequelize.QueryTypes.SELECT,
                        raw: true,
                        plain: false,
                        // logging: console.log
                    }
                ).then(result => result);
                console.log(isProduct[0].quantity);
                console.log(quantity);

                // if (isProduct.length != 0) {
                //     await db.query(`
                //         UPDATE order_detail od 
                //         SET od.quantity = ('${isProduct[0].quantity}' + '${quantity}')
                //         WHERE od.id = '${productId}'
                //         AND od.id_order = '${registeredOrder[0].id}'
                //     `);
                //     } else {}
                    // AGREGO PRODUCTO A ORDERS_dETAIL
                    db.query(`
                    INSERT INTO order_detail(id_order, id_product, quantity)
                    VALUES('${registeredOrder[0].id}', '${productId}', ${quantity})
                `);
                

                // ACTUALIZO LA FECHA DE MODIFICACION DE ORDER
                db.query(`
                    UPDATE orders o 
                    SET modification_date = '${dateOrder_mod}'
                    WHERE o.id = ${registeredOrder[0].id}
                `);

                //ACTUALIZO TOTAL PEDIDO 
                db.query(`
                    UPDATE orders o 
                    SET total_order = (SELECT SUM(od.quantity*p.price) FROM order_detail od
                    INNER JOIN products p ON p.id = od.id_product 
                    WHERE od.id_order = ${registeredOrder[0].id})
                    WHERE o.id = ${registeredOrder[0].id}
                `);

                res.status(201).json(`Se ha agregado el producto al carrito`);
            } else {
                // CREATE ORDER AND DETAIL ORDER
                await db.sequelize.query(`
                    INSERT INTO orders (
                        id_client,
                        id_payment_method,
                        id_order_status,
                        entry_date,
                        modification_date,
                        total_order
                    )
                    VALUES(
                        '${authData.userId}',
                        '${paymentMethod}',
                        '${orderStatus}',
                        '${dateOrder}',
                        '${dateOrder_mod}',
                        '${totalPedido}'
                    )`
                );

                // BUSCO ID DE ORDEN CON STATUS "NUEVA"
                const newOrder = await db.sequelize.query(`
                    SELECT * 
                    FROM orders o
                    WHERE id_client = ${authData.userId} 
                    AND id_order_status = "1"`,
                    {
                        type: db.Sequelize.QueryTypes.SELECT,
                        raw: true,
                        plain: false,
                        // logging: console.log
                    }
                ).then(result => result);

                db.query(`
                    INSERT INTO order_detail(id_order, id_product, quantity) 
                    VALUES('${newOrder[0].id}', '${productId}', '${quantity}')
                `);
            }
        }
    })
})
module.exports = router;


//BUSCAR SI EXISTE ORDEN "NUEVA" DE UN USUARIO ESPECIFICO - MIDDLEWARE
// const idOrdenExistente = db.query(SELECT o.id FROM orders o WHERE id_client = ${authdata.userId} AND id_order_Status = "1")


//if(idOrdenExistente.lenght != 0)
//POST ORDER_DETAIL  -- SIEMPRE LA RUTA SERA /ORDERS 
//{ agregar producto idOrdenExistente.id} 

//ORDER AND ORDER_DETAIL
//else{ crear orden y agregar producto }
