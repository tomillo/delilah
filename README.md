# Delilah Resto

Delilah Resto es una API generada para poder administrar un restaurante con distintos productos y distintos tipos de usuarios ya sea Clientes, Supervisor de Sucursal o Dueno.

## Comenzando

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

## Pre-requisitos

```bash
install XAMPP Program
install Postman Program

Inside Visual Studio
install body-parser
install cors
install express
install express-session
install jsonwebtoken
install moment
install morgan
install mysql2
install nodemon
install sequelize
```

## Instalacion

```bash
1) Levantar XAMPP para comenzar a crear la base de datos.
2) Dirigirse a PHPMy-Admin.
3) Crear una base de datos llamada delilah_resto.
4) Realizar la configuración del archivo DB/config.js
5) Importar los datos (delilah_resto.sql) situados en la carpeta del proyecto para poder trabajar.
6) Levantar el servidor y comprobar su funcionamiento.
7) Importar la colección en Postman (Delilah_Resto.postman_collection.json) situada en la carpeta del proyecto.
8) Ejecutar las rutas especificadas en Postman para corroborar su funcionamiento.
```

## Ejecutando las pruebas (Usage)

```python

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"CLIENTE"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users/:ID') # Generar un GET del usuario creado con el TOKEN generado + (Generar el GET de otro usuario !error).
    ('PUT/users/:ID') # Modificar el Usuario creado con el TOKEN generado + (Generar el PUT de otro usuario !error).
    ('POST/users/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/users/:ID/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.
    ('DELETE/users/:ID/favorites') # Eliminar el producto favoritos del usuario con el TOKEN generado.

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado + (Generar el GET de un producto inexistente !error).

    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    #Enviar en Postman el request body de un solo producto con su cantidad especificada. (En caso de querer agregar otro producto generar otro post indicado otro Id de Producto y su cantidad. Este mismo se va agregar a order_detail pero conforma parte de la misma orderId). 
    #Un usuario solamente puede tener una orden con estado Nueva (order_status: "1"). Si al agregar un producto el usuario no tiene ninguna orden con status Nueva, primero se crea la orden y luego se agrega el producto indicado. Si el usuario ya posee una orden con status Nueva, el producto enviado se agregara a la orden_detail referenciada a esa orden. 
    #Para confirmar una orden de status 1 ("nueva"), utilizar la ruta PUT/orders/:Id y pasar a "Confirmada"
    ('PUT/orders/:ID') # Confirmar la orden generada con el TOKEN generado. 
    #Por parametro se debe enviar el Id de la orden a confirmar, enviando en el Body la forma de pago. De esta manera esta orden pasara a status Confirmado.
    ('DELETE/orders/:ID') # Eliminar la orden completa o productos de la orden con el TOKEN generado.
    #Endpoint generado para eliminar productos especificos de una orden unicamente en casos de que la orden_status sea igual a 1. Las productos no pueden ser eliminados si la orden ya fue confirmada.
    ('GET/orders/:ID') # Traer el listado de ordenes del usuario con el TOKEN generado.

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"SUPERVISOR"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users/:ID') # Generar un GET del usuario deseado con el TOKEN generado + (Generar el GET de un usuario inexistente !error).
    ('POST/users/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/users/:ID/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.
    ('DELETE/users/:ID/favorites') # Eliminar el producto favoritos del usuario con el TOKEN generado.

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado con el TOKEN generado + (Generar el GET de un producto inexistente !error).
    ('DELETE/products/:ID') #Eliminar un producto con el TOKEN generado + (Generar el DELETE de un producto inexistente !error).

    ('GET/orders') # Traer el listado de todas las ordenes con el TOKEN generado. 
    ('GET/orders/:ID') # Traer la orden especifica con el TOKEN generado + (Generar el GET de una orden inexistente !error).
    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    ('PUT/orders/:ID') # Generar una nueva orden de pedido con el TOKEN generado + (Generar el PUT de una orden inexistente !error).
    ('PATCH/orders/:ID') # Modificar el estado de una orden: De Confirmada a Preparando a Enviando a Entregado + (Generar el PATCH de una orden inexistente !error).

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"ADMINISTRADOR"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users') # Traer el listado de todos los Usuarios.
    ('GET/users/:ID') # Generar un GET del usuario deseado con el TOKEN generado + (Generar el GET de un usuario inexistente !error).
    ('PUT/users/:ID') # Modificar un usuario deseado con el TOKEN generado + (Modificar un usuario inexistente !error).
    ('POST/users/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/users/:ID/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.
    ('DELETE/users/:ID/favorites') # Eliminar el producto favoritos del usuario con el TOKEN generado.

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado con el TOKEN generado + (Generar el GET de un producto inexistente !error).
    ('POST/products') # Generar un nuevo producto con el TOKEN generado.
    ('PUT/products/:ID') # Modificar un producto con el TOKEN generado + (Generar el PUT de un producto inexistente !error).
    ('DELETE/products/:ID') #Eliminar un producto con el TOKEN generado + (Generar el DELETE de un producto inexistente !error).

    ('GET/orders') # Traer el listado de Ordenes ya Confirmadas con el TOKEN generado. 
    ('GET/orders/:ID') # Traer la orden especifica con el TOKEN generado + (Generar el GET de una orden inexistente !error).
    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    ('PUT/orders/:ID') # Generar una nueva orden de pedido con el TOKEN generado + (Generar el PUT de una orden inexistente !error).
    ('PATCH/orders/:ID') # Modificar el estado de una orden: De Confirmada a Preparando a Enviando a Entregado + (Generar el PATCH de una orden inexistente !error).
```

## Construido con:

[JSONWEBTOKEN](https://www.npmjs.com/package/jsonwebtoken);
[MOMENT.js](https://momentjs.com/);
[MYSQLS2](https://www.npmjs.com/package/mysql2);
[SEQUELIZE](https://sequelize.org/)

## Subido en: 

[GITHUB](https://github.com/tomillo/delilah)


