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
async function updateStockProduct(order) {
    const productId = await db.sequelize.query(`
        SELECT  id_product,
                quantity
        FROM order_detail
        WHERE id_order = ${order}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    console.log(productId);
    productId.forEach(element => {
        db.query(`
            UPDATE products 
            SET stock = (stock - ${element.quantity})
            WHERE id = ${element.id_product}
        `);
    });
    
}

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

// TRAE INFORMACION DE TODAS LAS ORDENES
async function ordersInfo() {
    const order = await db.sequelize.query(`
        SELECT 
            o.id,
            u.user,
            u.name,
            u.last_name,
            u.phone,
            u.address,
            pm.description AS payment_method, 
            os.description AS order_status,
            o.total_order
        FROM users u
        INNER JOIN orders o ON o.id_client = u.id
        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
        INNER JOIN orders_status os ON os.id = o.id_order_status`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

// TRAE INFORMACION DE TODAS LAS ORDENES PARA SUPERVISOR
async function ordersInfobySupervisor() {
    const order = await db.sequelize.query(`
        SELECT 
            u.user,
            u.name,
            u.last_name,
            u.phone,
            u.address,
            pm.description AS payment_method, 
            os.description AS order_status,
            p.product_name,
            od.quantity,
            o.total_order
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
    ).then(result => result);
    return order;
}

// TRAE INFORMACION DE LA ORDEN SI ES CLIENTE
async function orderInfoByClient(userId, orderId) {
    const order = await db.sequelize.query(`
        SELECT
            u.id,
            u.user,
            u.name,
            u.last_name,
            u.phone,
            u.address,
            pm.description AS payment_method, 
            os.description AS order_status,
            o.id AS order_id,
            o.total_order
        FROM users u
        INNER JOIN orders o ON o.id_client = u.id
        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
        INNER JOIN orders_status os ON os.id = o.id_order_status
        WHERE u.id = ${userId}
        AND o.id = ${orderId}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

// TRAE INFORMACION DE LA ORDEN SI ES ADMIN
async function orderInfoByAdmin(orderId) {
    const order = await db.sequelize.query(`
        SELECT
            u.id,
            u.user,
            u.name,
            u.last_name,
            u.phone,
            u.address,
            pm.description AS payment_method, 
            os.description AS order_status,
            o.id AS order_id,
            o.total_order
        FROM users u
        INNER JOIN orders o ON o.id_client = u.id
        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
        INNER JOIN orders_status os ON os.id = o.id_order_status
        WHERE o.id = ${orderId}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

// TRAE INFORMACION DE LA ORDEN SI ES SUPERVISOR
async function orderInfoBySupervisor(orderId) {
    const order = await db.sequelize.query(`
        SELECT
            u.id,
            u.user,
            u.name,
            u.last_name,
            u.phone,
            u.address,
            pm.description AS payment_method, 
            os.description AS order_status,
            o.id AS order_id,
            o.total_order,
            o.id_order_status
        FROM users u
        INNER JOIN orders o ON o.id_client = u.id
        INNER JOIN payment_methods pm ON pm.id = o.id_payment_method
        INNER JOIN orders_status os ON os.id = o.id_order_status
        WHERE o.id = ${orderId}
        AND o.id_order_status != 1`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

// TRAE INFORMACION DE LOS PRODUCTOS AGREGADOS A LA ORDEN
async function orderProducts(orderId) {
    const order = await db.sequelize.query(`
        SELECT
            od.id,
            od.id_product,
            p.product_name,
            od.quantity
        FROM users u
        INNER JOIN orders o ON o.id_client = u.id
        INNER JOIN orders_status os ON os.id = o.id_order_status
        INNER JOIN order_detail od ON od.id_order = o.id
        INNER JOIN products p ON p.id = od.id_product
        WHERE o.id = ${orderId}`,{
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(result => result);
    return order;
}

router.get('/', authenticateUser, async (req, res) => {
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == '3') {
            res.status(401).json('No esta autorizado a realizar la consulta');
        } else if (authData.role == '1') {
            const ordersInfoFn = await ordersInfo();

            const ordersInfoFn_1 = ordersInfoFn.map(async (order) => {
                order.order_detail = [];
                const orderProductsFn = await orderProducts(order.id);

                orderProductsFn.map((products) => {
                    order.order_detail.push(products);
                });
            });

            await Promise.all(ordersInfoFn_1);
            res.status(200).json(ordersInfoFn);
        } else {
            const ordersInfoFn = await ordersInfobySupervisor();
            res.status(200).json(ordersInfoFn);
        }
    });
});

router.get('/:id', authenticateUser, (req, res) => {
    jwt.verify(req.token, privateKey, async (error, authData) => {
        const idParams = req.params;
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            const orderInfoFn = await orderInfoByClient(authData.userId, idParams.id);
            if (orderInfoFn.length != 0 && idParams.id == orderInfoFn[0].order_id) { 
                const orderProductsFn = await orderProducts(idParams.id);
                orderInfoFn[0].order_detail = orderProductsFn;
                res.status(200).json(orderInfoFn);
            } else {
                res.status(401).json('No está autorizado para ver las ordenes de otro usuario');
            }
        } else if (authData.role == 1) {
            const orderInfoFn = await orderInfoByAdmin(idParams.id);
            if (orderInfoFn.length != 0) {
                const orderProductsFn = await orderProducts(idParams.id);
                orderInfoFn[0].order_detail = orderProductsFn;
                res.status(200).json(orderInfoFn);
            } else {
                res.status(404).json("Esta orden no existe");
            }
        } else {
            const orderInfoFn = await orderInfoBySupervisor(idParams.id);
            if (orderInfoFn.length != 0) { 
                const orderProductsFn = await orderProducts(idParams.id);
                orderInfoFn[0].order_detail = orderProductsFn;
                res.status(200).json(orderInfoFn);
            } else {
                res.status(401).json("Sin autorización para ver esta orden");
            }
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
    const idParams = req.params.id;
    const { paymentMethod} = req.body;
    const modificationDate = moment().format("YYYY-MM-DD");
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else {
            const userOrder = await db.query(`SELECT o.id FROM orders o INNER JOIN users u ON o.id_client = u.id 
            WHERE u.id = ${authData.userId} AND o.id_order_status = 1 AND o.id='${idParams}'`);
            
            if (userOrder[0].length != 0) {
                db.query(`
                    UPDATE orders o
                    SET id_order_status = 2,
                        id_payment_method = ${paymentMethod},
                        modification_date = "${modificationDate}"
                    WHERE o.id = ${userOrder[0].id}
                `)
                updateStockProduct(userOrder[0].id);

                res.status(200).json('Se ha confirmado su compra');
            }  else {
                res.status(404).json('La orden indicada no existe');
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
            db.query(`
                UPDATE orders
                SET id_order_status = ${status},
                    modification_date = '${modificationDate}'
                WHERE id=${idParams.id}
            `);
            res.status(200).json(`Has cambiado la orden '${idParams.id}' a '${status}' exitosamente`)
        }
    })
})
// el cliente puede modificar el pedido, agregando -->POST y borrando -->DELETE productos de la orden con status nueva

//BORRAR UN PRODUCTO DE UNA ORDEN CON STATUS "NUEVA" CON ROL CLIENTE
router.delete('/:id', authenticateUser, (req, res) => {
    const idParams = req.params.id;
    const productDelete = req.body.productId;
    const modificationDate = moment().format("YYYY-MM-DD");
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error al verificar el token');
        } else if(authData.userId == idParams){
            const orderDetail = await db.query(`
                SELECT od.id
                FROM order_detail od
                INNER JOIN orders o ON o.id = od.id_order
                INNER JOIN users u ON o.id_client = u.id
                WHERE u.id = ${authData.userId}
                AND od.id_product = '${productDelete}'
                AND o.id_order_status = 1
            `);

            orderDetail.forEach(element => {
                db.query(`
                    DELETE FROM order_detail
                    WHERE id='${element.id}'
                `);
            });

            res.status(200).json(`El producto fue eliminado del carrito de compras.`)
        }else{
            res.status(404).json(`No esta autorizado a eliminar productos de otro usuario.`)
        }
    });
});
module.exports = router;



