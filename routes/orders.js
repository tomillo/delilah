const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require("../db/mysql_connection");

function orderValidator(req, res, next) {
    const { id_cliente, id_forma_pago, id_producto, cantidad } = req.body;
    if (!id_cliente || !id_forma_pago || !id_producto || !cantidad) {
        res.status(400).json('Falta completar un campo');

        if (cantidad > 0) {
            res.status(400).json('La cantidad debe ser mayor a 0');
        }

    } else {
        next();
    }
}
router.post('/', orderValidator, (req, res) => {
    const orderInfo = req.body;
    console.log(orderInfo);
    const fechaPedido = moment().format("YYYY-MM-DD");
    const fechaModifPedido = moment().format("YYYY-MM-DD");
    const estadoPedido = "1";
    let totalPedido = "0";

    const addOrder = db.query(`INSERT INTO pedidos (id_cliente, id_forma_pago, id_estado_pedido, fecha_pedido, fecha_modificacion, total_pedido) VALUES('${orderInfo.id_cliente}', '${orderInfo.id_forma_pago}', '${estadoPedido}', '${fechaPedido}', '${fechaModifPedido}', '${totalPedido}' `);
    
    const idPedido = db.query(`SELECT id FROM pedidos WHERE fecha_alta = ${fechaPedido}`);
    
    const detailOrder = db.query(`INSERT INTO detalle_pedido (id_pedido, id_producto, id_cantidad) VALUES ('${idPedido}', '${orderInfo.id_producto}', '${orderInfo.cantidad}')`)
    
    res.json(`Producto ingresado correctamente y agregado a la DB ${datos.producto}`)

})
//CLIENTE y ADMIN para buscar un usuario especifico por ID
// router.get('/:id' , (req , res) => {
//     const idParams = req.params.id;
//     db.sequelize.query(`SELECT p.producto, p.descripcion, p.foto, p.precio, p.stock, ep.descripcion 
//                             FROM productos p
//                             INNER JOIN estados_productos ep ON p.id_estado = ep.id
//                             WHERE p.id = ${idParams}`,
//         {
//             type: db.Sequelize.QueryTypes.SELECT,
//             raw: true,
//             plain: false,
//             logging: console.log
//         }
//     ).then(resultados => res.json(resultados));
// })
// // CLIENTE Y ADMIN para modificar un usuario especifico por ID
// router.put('/:id' , (req , res) => {
//         const idParams = req.params;
//         // console.log(idParams);
//         const newData = req.body;
//         const fechaModifUpdate = moment().format("YYYY-MM-DD");
//         const updateUser = db.query(`UPDATE productos SET producto = '${newData.producto}', descripcion = '${newData.descripcion}',foto = '${newData.foto}',
//                         stock = '${newData.stock}', fecha_modificacion = '${fechaModifUpdate}', id_estado= '${newData.id_estado}'
//                         WHERE id='${idParams.id}'`);
//         res.json(`El producto fue modificado correctamente y agregado a la DB ${newData.producto}`)
// })
module.exports = router;
