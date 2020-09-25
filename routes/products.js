const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require("../db/mysql_connection");

//ADMIN para ver todos los usuarios creados.
router.get('/', (req, res) => {
    db.sequelize.query(`SELECT p.producto, p.descripcion, p.foto, p.precio, p.stock, ep.descripcion 
                            FROM productos p
                            INNER JOIN estados_productos ep ON p.id_estado = ep.id`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(resultados => res.json(resultados));
})
//AGREGAR UNA VALIDACION DE QUE EL CORREO TENGA UN @
//VALIDAR QUE EXISTE UN SOLO USUARIOS 
//CLIENTE para crear un usuario.
function productValidator (req , res , next) {
    const {producto, descripcion, foto, precio, stock, id_estado} = req.body;
    if(!producto || !descripcion || !foto || !precio || !stock || !id_estado){
        res.status(400).json('Falta completar un campo');
    } else {
        next();
    }
}
router.post('/' , productValidator, (req , res) => {
    const datos = req.body;
    const fechaAlta = moment().format("YYYY-MM-DD");
    const fechaModificacion = moment().format("YYYY-MM-DD");
    const addUser =  db.query(`INSERT INTO productos(producto, descripcion, foto, precio, stock, fecha_alta, fecha_modificacion, id_estado) VALUES('${datos.producto}', '${datos.descripcion}', '${datos.foto}', '${datos.precio}', '${datos.stock}', '${fechaAlta}', '${fechaModificacion}', '${datos.id_estado}')`);
    res.status(201).json(`Producto agregado correctamente`)
})
//CLIENTE y ADMIN para buscar un usuario especifico por ID
router.get('/:id' , (req , res) => {
    const idParams = req.params.id;
    db.sequelize.query(`SELECT p.producto, p.descripcion, p.foto, p.precio, p.stock, ep.descripcion 
                            FROM productos p
                            INNER JOIN estados_productos ep ON p.id_estado = ep.id
                            WHERE p.id = ${idParams}`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(resultados => res.json(resultados));
})
// CLIENTE Y ADMIN para modificar un usuario especifico por ID
router.put('/:id' , (req , res) => {
        const idParams = req.params;
        // console.log(idParams);
        const newData = req.body;
        const fechaModifUpdate = moment().format("YYYY-MM-DD");
        const updateUser = db.query(`UPDATE productos SET producto = '${newData.producto}', descripcion = '${newData.descripcion}',foto = '${newData.foto}',
                        stock = '${newData.stock}', fecha_modificacion = '${fechaModifUpdate}', id_estado= '${newData.id_estado}'
                        WHERE id='${idParams.id}'`);
        res.json(`El producto fue modificado correctamente y agregado a la DB ${newData.producto}`)
})


router.delete('/:id' , (req , res) => {
    const idParams = req.params;
    // console.log(idParams);
    const updateUser = db.query(`DELETE FROM productos
                    WHERE id='${idParams.id}'`);
    res.json(`El producto fue eliminado correctamente`)
})

module.exports = router;
















