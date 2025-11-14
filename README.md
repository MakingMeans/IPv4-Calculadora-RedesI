# Calculadora de IPv4

Este proyecto consiste en el desarrollo de una **página web** que calcule información relacionada con una dirección **IP versión 4 (IPv4)**.  

La aplicación debe recibir una dirección IP en formato decimal (`X.X.X.X`) y su **máscara de red** (en formato decimal o en CIDR), y generar los siguientes resultados:

---

## **Requerimientos funcionales**

La aplicación debe mostrar:

1. **IP de red**
2. **IP de broadcast**
3. **Cantidad de IPs útiles (hosts)**
4. **Rango de IPs útiles**, por ejemplo: `192.168.0.1 - 192.168.0.254`
5. **Clase de IP**
6. **Si la IP es pública o privada**
7. **Porción de red y porción de host en binario**, de forma visual similar a un ejemplo de referencia

---

## **Salida esperada**
IP ingresada: 192.168.0.15
Máscara: 255.255.255.0

IP de Red: 192.168.0.0

IP de Broadcast: 192.168.0.255

Rango de IPs útiles: 192.168.0.1 - 192.168.0.254

Cantidad de hosts útiles: 254

Clase: C

Tipo: Privada

Porción de red: 11000000.10101000.00000000

Porción de host: 00001111

