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

// BUSCA ID DE ORDEN CON STATUS "NUEVA"
async function registeredOrder(userId) {
    const order = await db.sequelize.query(`
        SELECT *
        FROM orders o
        WHERE id_client = ${userId}
        AND id_order_status = "1"`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

// BUSCA SI EXISTE PRODUCTO AGREGADO A LA ORDEN
async function isProduct(productId, orderId) {
    const product = await db.sequelize.query(`
        SELECT od.quantity 
        FROM order_detail od
        WHERE od.id_product = ${productId}
        AND od.id_order = ${orderId}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return product
}

// ACTUALIZA CANTIDAD DE UN PRODUCTO EN UNA ORDEN
function updateProduct_qty(qtyExistant, qty, productId, orderId) {
    db.query(`
        UPDATE order_detail od 
        SET od.quantity = (${qtyExistant} + ${qty})
        WHERE od.id_product = ${productId}
        AND od.id_order = ${orderId}
    `);
}

// AGREGO PRODUCTO A ORDERS_DETAIL
function addProduct_qty(orderId, productId, qty) {
    db.query(`
        INSERT INTO order_detail(id_order, id_product, quantity)
        VALUES('${orderId}', '${productId}', ${qty})
    `);
}

// ACTUALIZA LA FECHA DE MODIFICACION DE ORDER
function newDateOrder(date, orderId) {
    db.query(`
        UPDATE orders o 
        SET modification_date = '${date}'
        WHERE o.id = ${orderId}
    `);
}

// ACTUALIZA TOTAL PEDIDO
async function totalOrder(orderId){
    db.query(`
        UPDATE orders o 
        SET total_order = (SELECT SUM(od.quantity*p.price) FROM order_detail od
        INNER JOIN products p ON p.id = od.id_product 
        WHERE od.id_order = ${orderId})
        WHERE o.id = ${orderId}
    `);
}

//ACTUALIZA EL STOCK DEL PRODUCTO POST PEDIDO

// CREAR ORDEN NUEVA
async function newOrder(userId, payment, orderStatus, dateOrder, dateOrder_mod) {
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
            '${userId}',
            '${payment}',
            '${orderStatus}',
            '${dateOrder}',
            '${dateOrder_mod}',
            '0'
        )`
    );
}

// BUSCA ID DE ORDEN CON STATUS "NUEVA"
async function isOrder(userId) {
    const order = await db.sequelize.query(`
        SELECT * 
        FROM orders o
        WHERE id_client = ${userId} 
        AND id_order_status = "1"`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
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

    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else {
            // CREAR DETAIL ORDER

            const orderData = await registeredOrder(authData.userId);
            if (orderData.length != 0) {

                const orderProduct_exist = await isProduct(productId, orderData[0].id, orderData[0].id);
                if (orderProduct_exist.length != 0) {
                    updateProduct_qty(orderProduct_exist[0].quantity, quantity, productId, orderData[0].id);
                } else {
                    addProduct_qty(orderData[0].id, productId, quantity);
                }

                newDateOrder(dateOrder_mod, orderData[0].id);                
                await totalOrder(orderData[0].id);

                res.status(201).json(`Se ha agregado el producto al carrito`);
            } else {
                // CREA ORDER Y DETAIL_ORDER

                await newOrder(authData.userId, paymentMethod, orderStatus, dateOrder, dateOrder_mod);
                const isOrderFn = await isOrder(authData.userId);
                addProduct_qty(isOrderFn[0].id, productId, quantity)
                await totalOrder(isOrderFn[0].id);

                res.status(201).json(`Se ha creado la orden`);
            }
        }
    })
})

//ENDPOINT PARA CAMBIAR ESTADO DE UNA ORDEN CON ROL CLIENTE
router.put('/:id' , authenticateUser, async (req, res) => {
    const idParams = req.params;
    const { paymentMethod} = req.body;
    const modificationDate = moment().format("YYYY-MM-DD");
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else {
            const userOrder = await db.query(`SELECT o.id FROM orders o INNER JOIN users u ON o.id_client = u.id 
            WHERE u.id = ${authData.userId} AND o.id_order_status = 1`);
            
            console.log(userOrder[0].id);
            if ( userOrder[0].length != 0) {
                db.query(`UPDATE orders o SET id_order_status = 2 , 
                id_payment_method = ${paymentMethod},
                modification_date = "${modificationDate}"
                WHERE o.id = ${userOrder[0].id}`)
                res.status(200).json('Se ha confirmado su compra');
            } 
        } 
    })
})

// Endpoint para cambiar de estado una orden con rol Supervisor.
router.patch('/:id' , authenticateUser, (req , res) => {
    const idParams = req.params;
    const { status } = req.body;

    const modificationDate = moment().format("YYYY-MM-DD");
    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            res.status(401).json('No esta autorizado a realizar esta accion');
        } else {
            db.query(`UPDATE orders SET 
                        id_order_status = ${status}, 
                        modification_date = '${modificationDate}' 
                        WHERE id=${idParams.id}`);
        res.json(`Has cambiado la orden '${idParams.id}' a '${status}' exitosamente`)
        }
    })
})
// el cliente puede modificar el pedido, agregando -->POST y borrando -->DELETE productos de la orden con status nueva

module.exports = router;



