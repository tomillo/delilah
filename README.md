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
4) Importar los datos situados en la carpeta.
del proyecto para poder trabajar con el proyecto.
5) Levantar el servidor y comprobar su funcionamiento.
6) Ejecutar las rutas especificadas en Postman para corroborar su funcionamiento.
```

## Ejecutando las pruebas (Usage)

```python

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"CLIENTE"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users/:ID') # Generar un GET del usuario creado con el TOKEN generado + (Generar el GET de otro usuario !error).
    ('PUT/users/:ID') # Modificar el Usuario creado con el TOKEN generado + (Generar el PUT de otro usuario !error).

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado + (Generar el GET de un producto inexistente !error).
    ('POST/products/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/products/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.

    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    ('PUT/orders/:ID') # Confirmar la orden generada con el TOKEN generado.
    ('DELETE/orders/:ID') # Eliminar la orden completa o productos de la orden con el TOKEN generado.
    ('GET/orders/:ID') # Traer el listado de ordenes del usuario con el TOKEN generado.

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"SUPERVISOR"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users/:ID') # Generar un GET del usuario deseado con el TOKEN generado + (Generar el GET de un usuario inexistente !error).

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado con el TOKEN generado + (Generar el GET de un producto inexistente !error).
    ('DELETE/products/:ID') #Eliminar un producto con el TOKEN generado + (Generar el DELETE de un producto inexistente !error).
    ('POST/products/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/products/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.

    ('GET/orders') # Traer el listado de todas las ordenes con el TOKEN generado. 
    ('GET/orders/:ID') # Traer la orden especifica con el TOKEN generado + (Generar el GET de una orden inexistente !error).
    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    ('PUT/orders/:ID') # Generar una nueva orden de pedido con el TOKEN generado + (Generar el PUT de una orden inexistente !error).
    ('PATCH/orders/:ID') # Modificar el estado de una orden: De Confirmada a Preparando a Enviando a Entregado + (Generar el PATCH de una orden inexistente !error).
    ('DELETE/orders/:ID') # Eliminar la orden completa o productos de la orden con el TOKEN generado.

!!!!!!!!----------------------------------------!!!!!!!!!!!!

"ADMINISTRADOR"

    ('POST/users') # Generar un nuevo usuario (Cliente).
    ('POST/login') # Logearse con el usuario creado y guardar TOKEN.
    ('GET/users') # Traer el listado de todos los Usuarios.
    ('GET/users/:ID') # Generar un GET del usuario deseado con el TOKEN generado + (Generar el GET de un usuario inexistente !error).
    ('PUT/users/:ID') # Modificar un usuario deseado con el TOKEN generado + (Modificar un usuario inexistente !error).

    ('GET/products') # Traer el listado de Productos.
    ('GET/products/:ID') # Traer el producto seleccionado con el TOKEN generado + (Generar el GET de un producto inexistente !error).
    ('POST/products') # Generar un nuevo producto con el TOKEN generado.
    ('PUT/products/:ID') # Modificar un producto con el TOKEN generado + (Generar el PUT de un producto inexistente !error).
    ('DELETE/products/:ID') #Eliminar un producto con el TOKEN generado + (Generar el DELETE de un producto inexistente !error).
    ('POST/products/:ID/favorites') # Agregar un producto a favoritos con el TOKEN generado.
    ('GET/products/favorites') # Listar los productos favoritos del usuario con el TOKEN generado.

    ('GET/orders') # Traer el listado de Ordenes ya Confirmadas con el TOKEN generado. 
    ('GET/orders/:ID') # Traer la orden especifica con el TOKEN generado + (Generar el GET de una orden inexistente !error).
    ('POST/orders') # Generar una nueva orden de pedido con el TOKEN generado.
    ('PUT/orders/:ID') # Generar una nueva orden de pedido con el TOKEN generado + (Generar el PUT de una orden inexistente !error).
    ('PATCH/orders/:ID') # Modificar el estado de una orden: De Confirmada a Preparando a Enviando a Entregado + (Generar el PATCH de una orden inexistente !error).
    ('DELETE/orders/:ID') # Eliminar la orden completa o productos de la orden con el TOKEN generado.
```

## Construido con:

[JSONWEBTOKEN](https://www.npmjs.com/package/jsonwebtoken);
[MOMENT.js](https://momentjs.com/);
[MYSQLS2](https://www.npmjs.com/package/mysql2);
[SEQUELIZE](https://sequelize.org/)

## Subido en: 

[GITHUB](https://github.com/tomillo/delilah)


