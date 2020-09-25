const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment');
const Sequelize = require('sequelize');
const privateKey = "112358";

const db = require("../DB/mysql_connection");

async function signValidator(userName, password){
    const userSelect = db.sequelize.query(`SELECT * FROM users WHERE (user = '${userName}' OR email = '${userName}') 
                        AND password = '${password}'`,

    {
        type: db.Sequelize.QueryTypes.SELECT,
            raw: true,
            plain: false,
            logging: console.log
    }).then(results => results);
    return userSelect;
             

}

router.post('/', async (req, res) => {
    const{userName, password} = req.body;
    const validated = await signValidator(userName, password);
    const role = validated[0].id_role;
    const userId = validated[0].id;

    if(validated.length==0){
        res.json({error: 'usuario o contraseña incorrecta'})
    }else {

        const token = jwt.sign({
            userName, role, userId    
        }, privateKey);
        res.json({token});
    }
})




module.exports = router;