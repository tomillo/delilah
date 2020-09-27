const express = require('express');
const moment = require('moment');
const { INSERT } = require('sequelize/types/lib/query-types');
const router = express.Router();
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
router.post('/', authenticateUser, (req, res) => {
    const { productName, quantity } = req.body;
    const orderData = req.body;
    const entryDateOrder = moment().format("YYYY-MM-DD");
    const modificationOrder = moment().format("YYYY-MM-DD");
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

                const createOrder = db.query(`INSERT INTO order (id_client, id_payment_method, id_order_status, entry_date, modification_date, total order)
                                              VALUES('${authData.userId}')`);//<----
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



// const addOrder = db.query(`INSERT INTO pedidos (id_cliente, id_forma_pago, id_estado_pedido, fecha_pedido, fecha_modificacion, total_pedido) VALUES('${orderInfo.id_cliente}', '${orderInfo.id_forma_pago}', '${estadoPedido}', '${fechaPedido}', '${fechaModifPedido}', '${totalPedido}' `);
    
//     const idPedido = db.query(`SELECT id FROM pedidos WHERE fecha_alta = ${fechaPedido}`);
    
//     const detailOrder = db.query(`INSERT INTO detalle_pedido (id_pedido, id_producto, id_cantidad) VALUES ('${idPedido}', '${orderInfo.id_producto}', '${orderInfo.cantidad}')`)
    
//     res.json(`Producto ingresado correctamente y agregado a la DB ${datos.producto}`//)