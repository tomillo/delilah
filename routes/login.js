const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";

const db = require("../db/mysql_connection");

async function signValidator(userName, password){
    const userSelect = db.sequelize.query(`
        SELECT * FROM users
        WHERE (user = '${userName}' OR email = '${userName}') AND password = '${password}'`,
        {
            type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            // logging: console.log
        }
    ).then(results => results);
    return userSelect;
}

router.post('/', async (req, res) => {
    const{userName, password} = req.body;
    const validated = await signValidator(userName, password);

    if (validated.length != 0){
        const role = validated[0].id_role;
        const userId = validated[0].id;
        const token = jwt.sign({
            userName, role, userId    
        }, privateKey);
        res.status(200).json({token});
    } else {
        res.status(400).json({error: 'Usuario o contraseña incorrecta'})
    }
})

module.exports = router;