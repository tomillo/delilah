const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";

const db = require("../db/mysql_connection");

async function contactValidator(req, res, next) {
    //validar correo y usuario con @
    const { user, name, lastName, email, phone, address, password} = req.body;
    // const usuarios = db.query(`SELECT usuario, correo FROM usuarios`)

    const searchUser_dup = await db.sequelize.query(`
		SELECT * FROM users WHERE (user = '${user}' OR email = '${email}')`,
		{
			type: db.Sequelize.QueryTypes.SELECT,
			raw: true,
			plain: false,
			// logging: console.log
		}
	);
    
    
    if (searchUser_dup.length != 0) {
		if (searchUser_dup[0].user == user) {
			res.status(400).json('El nombre de usuario ya existe');
		} else if (searchUser_dup[0].email == email) {
			res.status(400).json('El correo ya existe');
		}
	} else {
		next();
	}
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

router.get('/', authenticateUser, (req, res) => {
    //validar el usuario que consulta
    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(401).json('No esta autorizado a realizar la consulta');
        } else {
            // console.log(`req.token ${req.token}`)
            // console.log(`authData ${authData.permisoUsuario}`)

            db.sequelize.query(`SELECT u.user, u.name, u.last_name, u.email, u.phone, u.address, u.entry_date, e.description, p.name AS role
                            FROM users u
                            INNER JOIN user_status e ON u.id_status=e.id
                            INNER JOIN role p ON p.id=u.id_role`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    logging: console.log
                }
            ).then(result => res.json(result));
        }

    })
})

router.get('/:id', authenticateUser, (req, res) => {
    jwt.verify(req.token, privateKey, async (error, authData) => {
        const idParams = req.params;
        // const role = authData.role;
        // const userId = authData.userId;

        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            //PONER SELECT CON ID DE USUARIO
            if (authData.userId == idParams.id) {
                db.sequelize.query(`SELECT u.id, u.user, u.name, u.last_name, u.email, u.phone, u.address, u.entry_date, e.description, p.name AS role
                                    FROM users u
                                    INNER JOIN user_status e ON u.id_status=e.id
                                    INNER JOIN role p ON p.id=u.id_role
                                    WHERE u.id = ${idParams.id}`,
                    {
                        type: db.Sequelize.QueryTypes.SELECT,
                        raw: true,
                        plain: false,
                        logging: console.log
                    }
                ).then(result => res.json(result));
            } else {
                res.status(401).json('Su usuario no esta autorizado para ejecutar esta consulta');
            }
        } else {
            // console.log(`req.token ${req.token}`)
            // console.log(`authData ${authData.permisoUsuario}`)
            const searchUser = await db.sequelize.query(`
				SELECT * FROM users WHERE id = '${idParams.id}'`,
				{
					type: db.Sequelize.QueryTypes.SELECT,
					raw: true,
					plain: false,
					// logging: console.log
				}
            );
            if (searchUser.length != 0) {
                db.sequelize.query(`SELECT u.id, u.user, u.name, u.last_name, u.email, u.phone, u.address, u.entry_date, e.description, p.name AS role
                                FROM users u
                                INNER JOIN user_status e ON u.id_status=e.id
                                INNER JOIN role p ON p.id=u.id_role
                                WHERE u.id = ${idParams.id}`,
                    {
                        type: db.Sequelize.QueryTypes.SELECT,
                        raw: true,
                        plain: false,
                        logging: console.log
                    }
                ).then(result => res.json(result));
            } else {
				res.status(500).json('Usuario no encontrado');
			}

        }
    })

})
//CORREGIR
router.post('/', contactValidator, (req, res) => {
    const data = req.body;
    const entryDate = moment().format("YYYY-MM-DD");
    const modificationDate = moment().format("YYYY-MM-DD");
    const idStatus = "1";
    const idRole = "3";

    // console.log(fechaAlta);
    // console.log(req.body);
    
    const addUser = db.query(`INSERT INTO users(user, name, last_name, email, phone, address, password, entry_date, modification_date, id_status, id_role) VALUES('${data.user}', '${data.name}', '${data.lastName}', '${data.email}', '${data.phone}', '${data.address}', '${data.password}', '${entryDate}', '${modificationDate}', '${idStatus}', '${idRole}')`);
    res.json(`Usuario ingresado correctamente y agregado a la DB ${data.user}`);

    
})

// administrador puede editar todo
// cliente name, lastName, phone, address, password
router.put('/:id', contactValidator, authenticateUser, (req, res) =>{
    jwt.verify(req.token, privateKey, async (error, authData) => {
        const newData = req.body;
        const idParams = req.params;
        const modificationDate = moment().format("YYYY-MM-DD");
        // const role = authData.role;
        // const userId = authData.userId;

        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            //PONER SELECT CON ID DE USUARIO
            if (authData.userId == idParams.id) {
                const updateUser = db.query(`UPDATE users SET name = '${newData.name}',last_name = '${newData.lastName}', phone = '${newData.phone}',address = '${newData.address}',password = '${newData.password}', modification_date = '${modificationDate}'
                    WHERE id='${idParams.id}'`);
                
                    res.status(200).json(`El Usuario fue modificado correctamente`);
            } else {
                res.status(401).json('Su usuario no esta autorizado para ejecutar esta consulta');
            }
        } else if (authData.role == 1) {
            // console.log(`req.token ${req.token}`)
            // console.log(`authData ${authData.permisoUsuario}`)
            const searchUser = await db.sequelize.query(`
				SELECT * FROM users WHERE id = '${idParams.id}'`,
				{
					type: db.Sequelize.QueryTypes.SELECT,
					raw: true,
					plain: false,
					// logging: console.log
				}
            );
            if (searchUser.length != 0) {
                const updateUser = db.query(`UPDATE users SET name = '${newData.name}',last_name = '${newData.lastName}',
                    phone = '${newData.phone}',address = '${newData.address}', password = '${newData.password}',
                    modification_date = '${modificationDate}', id_role= '${newData.id_role}', id_status = '${newData.id_status}'
                    WHERE id='${idParams.id}'`);
                
                res.status(200).json(`El usuario fue modificado correctamente`);
            } else {
				res.status(404).json('El usuario indicado no existe');
			}
        } else {
            res.status(401).json('No está autorizado para modificar usuarios');
        }
    })
})



  module.exports = router;