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

async function isFavorites(productId, userId){
    const favorite = db.sequelize.query(`
        SELECT id
        FROM favorites
        WHERE id_client = '${userId}'
        AND id_product = '${productId}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => (result));
    return favorite;
}

async function favoritesInfo(userId) {
    const favorites = db.sequelize.query(`
    SELECT u.user, p.product_name
    FROM products p 
    INNER JOIN favorites f
    ON f.id_product = p.id
    INNER JOIN users u
    ON u.id = f.id_client
    WHERE u.id = '${userId}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => (result));
    return favorites;
}

async function userExist(userId){
    const user = db.sequelize.query(`
        SELECT user
        FROM users
        WHERE id = '${userId}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
        }
    ).then(result => (result));
    return user;
}

async function favoritesDelete(favoriteId){
    const favorite = db.query(`DELETE FROM favorites
                                WHERE id = '${favoriteId}'`)
    return favorite

}

router.get('/', authenticateUser, (req, res) => {
    //validar el usuario que consulta
    jwt.verify(req.token, privateKey, (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role != '1') {
            res.status(404).json('No esta autorizado a realizar esta consulta');
        } else {
            db.sequelize.query(`
                SELECT  u.user,
                        u.name,
                        u.last_name,
                        u.email,
                        u.phone,
                        u.address,
                        u.entry_date,
                        e.description,
                        p.name AS role
                FROM users u
                INNER JOIN user_status e ON u.id_status=e.id
                INNER JOIN role p ON p.id=u.id_role`,
                {
                    type: db.Sequelize.QueryTypes.SELECT,
                    raw: true,
                    plain: false,
                    logging: console.log
                }
            ).then(result => res.status(200).json(result));
        }
    });
});

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
                db.sequelize.query(`
                    SELECT  u.id,
                            u.user,
                            u.name,
                            u.last_name,
                            u.email,
                            u.phone,
                            u.address,
                            u.entry_date,
                            e.description,
                            p.name AS role
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
                ).then(result => res.status(200).json(result));
            } else {
                res.status(401).json('No esta autorizado para ejecutar esta consulta');
            }
        } else {
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
                db.sequelize.query(`
                    SELECT  u.id,
                            u.user,
                            u.name,
                            u.last_name,
                            u.email,
                            u.phone,
                            u.address,
                            u.entry_date,
                            e.description,
                            p.name AS role
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
                ).then(result => res.status(200).json(result));
            } else {
				res.status(500).json('Usuario no encontrado');
			}

        }
    })

})

router.post('/', contactValidator, (req, res) => {
    const data = req.body;
    const entryDate = moment().format("YYYY-MM-DD");
    const modificationDate = moment().format("YYYY-MM-DD");
    const idStatus = "1";
    const idRole = "3";
    
    db.query(`
        INSERT INTO users(
            user,
            name,
            last_name,
            email,
            phone,
            address,
            password,
            entry_date,
            modification_date,
            id_status,
            id_role
        ) VALUES(
            '${data.user}',
            '${data.name}',
            '${data.lastName}',
            '${data.email}',
            '${data.phone}',
            '${data.address}',
            '${data.password}',
            '${entryDate}',
            '${modificationDate}',
            '${idStatus}',
            '${idRole}'
        )
    `);
    res.status(201).json(`Usuario ingresado correctamente y agregado a la DB ${data.user}`);
})

// administrador puede editar todo
// cliente name, lastName, phone, address, password
router.put('/:id', authenticateUser, (req, res) =>{
    jwt.verify(req.token, privateKey, async (error, authData) => {
        const newData = req.body;
        const idParams = req.params;
        const modificationDate = moment().format("YYYY-MM-DD");

        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == 3) {
            //PONER SELECT CON ID DE USUARIO
            if (authData.userId == idParams.id) {
                const updateUser = db.query(`
                    UPDATE users
                    SET name = '${newData.name}',
                        last_name = '${newData.lastName}',
                        phone = '${newData.phone}',
                        address = '${newData.address}',
                        password = '${newData.password}',
                        modification_date = '${modificationDate}'
                    WHERE id='${idParams.id}'
                `);
                
                res.status(200).json(`El Usuario fue modificado correctamente`);
            } else {
                res.status(404).json('Su usuario no esta autorizado para ejecutar esta acción');
            }
        } else if (authData.role == 1) {
            const searchUser = await db.sequelize.query(`
                SELECT *
                FROM users
                WHERE id = '${idParams.id}'`,
				{
					type: db.Sequelize.QueryTypes.SELECT,
					raw: true,
					plain: false,
					// logging: console.log
				}
            );
            if (searchUser.length != 0) {
                const updateUser = db.query(`
                    UPDATE users
                    SET name = '${newData.name}',
                        last_name = '${newData.lastName}',
                        phone = '${newData.phone}',
                        address = '${newData.address}',
                        password = '${newData.password}',
                        modification_date = '${modificationDate}',
                        id_role= '${newData.id_role}',
                        id_status = '${newData.id_status}'
                    WHERE id='${idParams.id}'
                `);
                
                res.status(200).json(`El usuario fue modificado correctamente`);
            } else {
				res.status(500).json('El usuario indicado no existe');
			}
        } else {
            res.status(401).json('No está autorizado para modificar usuarios');
        }
    })
})

//AGREGA FAVORITOS POR ID DE USUARIO, VERIFICA QUE EL PRODUCTO EXISTA Y QUE NO SEA UN FAVORITO
router.post('/:id/favorites', authenticateUser, async (req, res) => {
    const idParams = req.params.id;
    const productId = req.body.productId;
    jwt.verify(req.token, privateKey, async (error, authData) => {
        const product = await db.sequelize.query(`
        SELECT 
            id 
        FROM products 
        WHERE id = '${productId}'`,
            {
                type: db.Sequelize.QueryTypes.SELECT,
                raw: true,
                plain: false,
                logging: console.log
            }
        ).then(result => result);

        const favorite = await isFavorites(productId, authData.userId);

        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (product.length != 0) {
            if (favorite == 0) {
                await db.sequelize.query(`
                    INSERT INTO favorites(
                        id_client, 
                        id_product
                    )
                    VALUES(
                        '${authData.userId}', 
                        '${productId}'   
                    )`);
                res.status(201).json(`Se ha agregado el producto a favoritos`);
            } else {
                res.status(401).json("El producto indicado ya es un favorito");
            }
        } else {
            res.status(404).json("Producto no encontrado");
        }
    })
})

//VISUALIZAR FAVORITOS POR ID DE USUARIO, ADMINISTRADOR TODOS.
//VALIDA TOKEN, QUE EXISTA EL USUARIO Y QUE TENGA FAVORITOS
router.get('/:id/favorites', authenticateUser, (req, res) => {
    const idParams = req.params.id;
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == '3') {
            if (authData.userId == idParams) {
                const favoritesInfoFn = await favoritesInfo(authData.userId);
                if (favoritesInfoFn.length != 0) {
                    res.status(200).json(favoritesInfoFn);
                } else {
                    res.status(404).json('Aun no tienes cargado favoritos');
                }
            } else {
                res.status(401).json('No está autorizado para ver los favoritos de otro usuario');
            }

        } else {
            const userExistFn = await userExist(idParams);
            const favoritesInfoFn = await favoritesInfo(idParams);
            if (userExistFn.length != 0) {
                if(favoritesInfoFn.length != 0){
                res.status(200).json(favoritesInfoFn);
                }else{
                    res.status(404).json('El usuario indicado no tiene favoritos');
                }
            } else {
                res.status(404).json('El usuario indicado no existe');
            }
        }
    })
})

router.delete('/:id/favorites', authenticateUser, (req, res) => {
    const idParams = req.params.id;
    const favoriteDelete = req.body.favoriteDelete;
   
    jwt.verify(req.token, privateKey, async (error, authData) => {
        if (error) {
            res.status(401).json('Error en verificar el token');
        } else if (authData.role == '3') {
            if (authData.userId == idParams) {
                const favoritesInfoFn = await isFavorites(favoriteDelete, authData.userId);
                
                if (favoritesInfoFn.length != 0) {
                    await favoritesDelete(favoritesInfoFn[0].id);
                    
                    res.status(200).json('Favorito eliminado');
                } else {
                    res.status(404).json('El producto indicado no es un favorito');
                }
            } else {
                res.status(401).json('No está autorizado para realizar esta acción');
            }

        } else {
            const favoritesInfoFn = await isFavorites(favoriteDelete, idParams);
            const userExistFn = await userExist(idParams);
            
            if (userExistFn.length != 0) {
                if (favoritesInfoFn.length != 0) {

                    await favoritesDelete(favoritesInfoFn[0].id);
                    res.status(200).json('Favorito eliminado');
                } else {
                    res.status(404).json('El usuario indicado no tiene el producto indicado como favorito');
                }
            } else {
                res.status(404).json('El usuario indicado no existe');
            }
        }
    })
})
module.exports = router;