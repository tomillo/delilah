// Testssss
//install body-parser / jsonwebtoken / express / nodemon
//NODE MODULES

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const loginRouter = require('./routes/login');
const moment = require('moment');

//SERVER
const server = express();

//BODYPARSER
server.use(bodyParser.json());

//TOKEN
const privateKey = 'token1123';

const db = require("./db/mysql_connection")
db.init()
  .then(async () => {
	console.log('DB connected');
}).catch((err) => {
    console.log('Error al conectar a la db', err);
  });	


//INICIALIZANDO SERVER
server.listen(3000, () => {
	console.log('Server funcionando')
});


server.use('/users', usersRouter);
server.use('/products', productsRouter);
server.use('/orders', ordersRouter);
server.use('/login', loginRouter)




//CREATE USER

// server.post('/usuarios/' , (req,res) => {
// 	const {name, lastName, mail, password } = req.body;

// 	let userObj = {
// 		id: idUser,
// 		name: req.body.name,
// 		lastName: req.body.lastName,
// 		mail: req.body.mail,
// 		password: req.body.password
// 	};
	
// 	// Validación formulario
// 	if (!name || !lastName || !mail || !password) {
// 		res.status(200).json({
// 			status: false,
// 			info: "Todos los campos son obligatorios"
// 		});
// 	} else {
// 		// Email duplicados en array
// 		const found = arrayUser.some(user => user.mail === mail)
// 		if (found) {
// 			return res.status(200).json({
// 				status: false,
// 				info: `El email ya existe en la DB`
// 			});
// 		} else {
// 			// Agrega usuario
// 			arrayUser.push(userObj);
// 			idUser++;
			
// 			res.status(200).json({
// 				status: true,
// 				info: `Felicidades ${req.body.name}. Ahora debes ingresar tus datos de sesión.`
// 			});
// 		}
// 	}
// });
// server.post('/user/login', (req,res) => {})