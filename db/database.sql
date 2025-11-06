
-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `db_proyecto_final` ;

-- 2. TABLA USER (USUARIOS)
-- Contiene la información de login y autenticación.
DROP TABLE IF EXISTS `db_proyecto_final`.`user` ;
CREATE TABLE IF NOT EXISTS `db_proyecto_final`.`user` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL, -- Almacena la contraseña cifrada
  `nombre` VARCHAR(45) NULL,
  `rol` VARCHAR(45) NOT NULL DEFAULT 'cliente', 
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);
-- 3. TABLA PRODUCTOS (EL MENÚ DINÁMICO)
-- Contiene la información del menú y los precios.
DROP TABLE IF EXISTS `db_proyecto_final`.`Productos` ;

CREATE TABLE IF NOT EXISTS `db_proyecto_final`.`Productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `descripcion` TEXT NULL,
  `precio` DECIMAL(10,2) NOT NULL, 
  `imagen_url` VARCHAR(255) NULL,
  PRIMARY KEY (`id_producto`));
 
-- 4. TABLA PEDIDOS
-- Contiene la información general de la orden (quién, cuándo, cuánto).
DROP TABLE IF EXISTS `db_proyecto_final`.`Pedidos` ;

CREATE TABLE IF NOT EXISTS `db_proyecto_final`.`Pedidos` (
  `id_pedido` INT NOT NULL AUTO_INCREMENT,
  `id_user` INT NOT NULL, -- Columna que será FK
  `fecha_hora` DATETIME NOT NULL,
  `total` DECIMAL(10,2) NOT NULL, 
  `estado` VARCHAR(45) NOT NULL, 
  `id_transaccion_mp` VARCHAR(45) NULL, -- ID de Mercado Pago, puede ser NULL inicialmente
  PRIMARY KEY (`id_pedido`),
  -- DEFINICIÓN DE CLAVE FORÁNEA: Conecta Pedidos con el Usuario
  CONSTRAINT `fk_Pedidos_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `db_proyecto_final`.`user` (`id_user`));
-- 5. TABLA DETALLE_PEDIDO
-- Contiene qué productos y cuántos se compraron en cada pedido.
DROP TABLE IF EXISTS `db_proyecto_final`.`detalle_pedido` ;

CREATE TABLE IF NOT EXISTS `db_proyecto_final`.`detalle_pedido` (
  `id_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_pedido` INT NOT NULL, -- Columna que  FK (al pedido)
  `id_producto` INT NOT NULL, -- Columna que  FK (al producto del menú)
  `precio_unitario` DECIMAL(10,2) NOT NULL, -- Precio al momento de la compra
  PRIMARY KEY (`id_detalle`),

  -- DEFINICIÓN DE CLAVE FORÁNEA: Conecta el detalle con el Pedido
  CONSTRAINT `fk_detalle_pedido_Pedidos`
    FOREIGN KEY (`id_pedido`)
    REFERENCES `db_proyecto_final`.`Pedidos` (`id_pedido`),

  -- DEFINICIÓN DE CLAVE FORÁNEA: Conecta el detalle con el Producto
  CONSTRAINT `fk_detalle_pedido_Productos`
    FOREIGN KEY (`id_producto`)
    REFERENCES `db_proyecto_final`.`Productos` (`id_producto`));

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;