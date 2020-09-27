const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";
const db = require("../db/mysql_connection");

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

router.get('/', authenticateUser, (req, res) => {

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role = '3') {
            res.status(401).json('No esta autorizado a realizar la consulta');
        } else if (authData.role = '1'){
            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.phone, u.address, pm.description AS payment_method, 
                        os.description AS order_status, p.product_name, o.total_order
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
                    logging: console.log
                }
            ).then(result => res.json(result));
        }else{
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
                    logging: console.log
                }
            ).then(result => res.json(result));
        }
    });
})

router.post('/', authenticateUser, (req, res) => {
    const { productName, quantity } = req.body;
    const orderData = req.body;
    const entryDateOrder = moment().format("YYYY-MM-DD");
    const modificationOrder = moment().format("YYYY-MM-DD");
    const paymentMethod = "1"
    const orderStatus = "1";
    let totalPedido = "0";

    //BUSCO EL ID DEL PRODUCTO SELECCIONADO
    const product = db.sequelize.query(`SELECT p.id FROM products p 
                                                    WHERE product_name = ${orderData.productName}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => res.json(result));

    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else { //CREAR DETAIL ORDER

            //BUSCO ID DE ORDEN CON STATUS "NUEVA"
            const registeredOrder = db.sequelize.query(`SELECT p.id FROM products o 
                                                        WHERE id_client = ${authData.userId} 
                                                        AND id_order_status = "1"`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    logging: console.log
                }
            ).then(result => res.json(result));

            console.log(registeredOrder);

            if (registeredOrder.lenght != 0) {

                //AGREGO PRODUCTO A ORDERS_dETAIL
                const addOrderDetail = db.query(`INSERT INTO order_detail(id_order, id_product, quantity) 
                                                VALUES('${registeredOrder.id}', '${product}', '${orderData.quantity}')`);

                //ACTUALIZO LA FECHA DE MODIFICACION DE ORDER                               
                const updateOrder = db.query(`UPDATE order o SET modification_date = ${modificationOrder}
                                              WHERE o.id = ${registeredOrder.id}`);

                res.status(201).json(`Se ha agregado el producto ${orderData.productName} al carrito`);
            } else { //CREATE ORDER AND DETAIL ORDER

                const createOrder = db.sequelize.query(`INSERT INTO order (id_client, id_payment_method, id_order_status, entry_date, modification_date, total order)
                                              VALUES('${authData.userId}', ${paymentMethod}, ${orderStatus}, ${entryDateOrder}, ${modificationOrder}, ${totalPedido})`);

                //FALTA RETORNAR ID DE LA ORDEN CREADA PARA ASIGNARSELA A LA ORDER DETAIL!!!!!!!///                              
                const addProduct = db.query(`INSERT INTO order_detail(id_order, id_product, quantity) 
                                            VALUES('${createOrder.id}', '${product}', '${orderData.quantity}')`);                             
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
