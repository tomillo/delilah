-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-10-2020 a las 00:48:23
-- Versión del servidor: 10.4.14-MariaDB
-- Versión de PHP: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `delilah_resto`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `id_client` int(11) NOT NULL,
  `id_product` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `favorites`
--

INSERT INTO `favorites` (`id`, `id_client`, `id_product`) VALUES
(1, 3, 1),
(2, 3, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `id_client` int(11) NOT NULL,
  `id_payment_method` int(11) NOT NULL,
  `id_order_status` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `modification_date` date NOT NULL,
  `total_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `id_client`, `id_payment_method`, `id_order_status`, `entry_date`, `modification_date`, `total_order`) VALUES
(1, 3, 1, 2, '2020-10-07', '2020-10-07', 3750),
(2, 3, 1, 1, '2020-10-07', '2020-10-07', 450);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders_status`
--

CREATE TABLE `orders_status` (
  `id` int(11) NOT NULL,
  `description` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders_status`
--

INSERT INTO `orders_status` (`id`, `description`) VALUES
(1, 'Nuevo'),
(2, 'Confirmado'),
(3, 'Preparando'),
(4, 'Enviando'),
(5, 'Entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_detail`
--

CREATE TABLE `order_detail` (
  `id` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `order_detail`
--

INSERT INTO `order_detail` (`id`, `id_order`, `id_product`, `quantity`) VALUES
(1, 1, 1, 3),
(2, 1, 2, 6),
(3, 2, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL,
  `description` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `description`) VALUES
(1, 'Efectivo'),
(2, 'Débito'),
(3, 'Crédito'),
(4, 'Mercado Pago');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_name` varchar(40) NOT NULL,
  `description` varchar(80) NOT NULL,
  `photo` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `stock` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `modification_date` date NOT NULL,
  `id_status` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `product_name`, `description`, `photo`, `price`, `stock`, `entry_date`, `modification_date`, `id_status`) VALUES
(1, 'Sandwich de milanesa', 'Sandwich de milanesa con lechuga y tomate', 'www.lafoto22.com', 350, 22, '2020-10-07', '2020-10-07', 1),
(2, 'Hamburguesa vegie', 'Hamburguesa de hongos con lechuga y tomate', 'www.lafoto22.com', 450, 14, '2020-10-07', '2020-10-07', 1),
(3, 'Hamburguesa doble', 'Doble hamburguesa, queso cheddar y tomate', 'www.lafoto22.com', 500, 32, '2020-10-07', '2020-10-07', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_status`
--

CREATE TABLE `products_status` (
  `id` int(11) NOT NULL,
  `description` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `products_status`
--

INSERT INTO `products_status` (`id`, `description`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `description` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `role`
--

INSERT INTO `role` (`id`, `name`, `description`) VALUES
(1, 'administrador', 'Super Usuario'),
(2, 'supervisor', 'Empleado'),
(3, 'cliente', 'usuario final');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `last_name` varchar(40) NOT NULL,
  `email` varchar(60) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `address` varchar(80) NOT NULL,
  `password` varchar(16) NOT NULL,
  `entry_date` date NOT NULL,
  `modification_date` date NOT NULL,
  `id_status` int(20) NOT NULL,
  `id_role` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `name`, `last_name`, `email`, `phone`, `address`, `password`, `entry_date`, `modification_date`, `id_status`, `id_role`) VALUES
(1, 'jperez', 'Juan', 'Perez', 'jperez@gmail.com', '3515111111', 'Nunez 1220', '1234', '2020-10-07', '2020-10-07', 1, 1),
(2, 'mgonzalez', 'Maria', 'Gonzalez', 'mgonzalez@gmail.com', '3515111111', 'Gauss 1220', '1123', '2020-10-07', '2020-10-07', 1, 2),
(3, 'mramirez', 'Marcelo', 'Ramirez', 'mramirez@gmail.com', '3515111111', 'Naciones Unidas 1220', '11223', '2020-10-07', '2020-10-07', 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_status`
--

CREATE TABLE `user_status` (
  `id` int(11) NOT NULL,
  `description` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `user_status`
--

INSERT INTO `user_status` (`id`, `description`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orders_status`
--
ALTER TABLE `orders_status`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_detail`
--
ALTER TABLE `order_detail`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products_status`
--
ALTER TABLE `products_status`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user_status`
--
ALTER TABLE `user_status`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `orders_status`
--
ALTER TABLE `orders_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `order_detail`
--
ALTER TABLE `order_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `products_status`
--
ALTER TABLE `products_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `user_status`
--
ALTER TABLE `user_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
