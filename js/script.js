// Convierte "X.X.X.X" a entero 32-bit, o null si inválido
function ipToInt(ip){
  const parts = ip.trim().split('.');
  if(parts.length !== 4) {
    return null;
  }
  const nums = parts.map(p => Number(p));
  for(const n of nums) {
    if(Number.isNaN(n) || n < 0 || n > 255) {
      return null;
    }
  }
  return (((nums[0] & 0xFF) << 24) >>> 0) |
         (((nums[1] & 0xFF) << 16) >>> 0) |
         (((nums[2] & 0xFF) << 8)  >>> 0) |
         ((nums[3] & 0xFF) >>> 0);
}

// Convierte entero 32-bit sin signo a "X.X.X.X"
function intToIp(x){
  return [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join('.');
}

// Acepta "/XX" o "X.X.X.X" y devuelve máscara como entero 32-bit o null
function maskFromInput(maskStr){
  maskStr = maskStr.trim();
  if(maskStr.startsWith('/')){
    const p = Number(maskStr.slice(1));
    if(Number.isNaN(p) || p < 0 || p > 32) {
      return null;
    }
    return p === 0 ? 0 : ((~0 << (32 - p)) >>> 0);
  } else {
    const m = ipToInt(maskStr);
    if(m === null) {
      return null;
    }
    return m >>> 0;
  }
}

// Cuenta los '1' en la mascara
function prefixLengthFromMask(maskInt){
  let cnt = 0;
  for(let i = 0; i < 32; i++){
    if(((maskInt >>> (31 - i)) & 1) === 1) {
      cnt++;
    }
  }
  return cnt;
}

// Calcula la información principal de la ip
function computeAll(ipStr, maskStr){
  const ip = ipToInt(ipStr);
  const maskInt = maskFromInput(maskStr);
  if(ip === null && maskInt === null) {
    return "invalidBoth";
  }
  if(ip === null) {
    return "invalidIp";
  }
  if(maskInt === null) {
    return "invalidMask";
  }

  const net = (ip & maskInt) >>> 0;
  const bc  = (net | (~maskInt >>> 0)) >>> 0;
  const hosts = Math.max(0, (bc - net - 1));
  const prefix = prefixLengthFromMask(maskInt);
  return { ip, maskInt, network: net, broadcast: bc, hosts, prefix };
}

// Convertir a ip en binario
function toBinaryDot(x){
  const parts = [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255];
  return parts.map(p => p.toString(2).padStart(8,'0')).join('.');
}

// Resalta los bits de red y de host con .bit-net y .bit-host
function highlightBinaryBits(binStr, prefix){
  const plain = binStr.replace(/\./g,'');
  const pieces = [];
  for(let i = 0; i < 32; i++){
    const bit = plain[i];
    if(i < prefix) {
      pieces.push('<span class="bit-net">'+bit+'</span>');
    }
    else {
      pieces.push('<span class="bit-host">'+bit+'</span>');
    }
    if((i+1) % 8 === 0 && i !== 31) {
      pieces.push('<span style="margin:0 6px">.</span>');
    }
  }
  return pieces.join('');
}

// Clasifica las ip de su tipo de clase y acceso
function classifyIp(ipStr){
  const p = ipStr.split('.').map(x => Number(x));
  const first = p[0];

  let clase = 'Otra';
  if(first >= 0 && first <= 126) clase = 'Clase A';
  else if(first >= 128 && first <= 191) clase = 'Clase B';
  else if(first >= 192 && first <= 223) clase = 'Clase C';
  else if(first >= 224 && first <= 239) clase = 'Clase D';
  else if(first >= 240 && first <= 254) clase = 'Clase E';

  let tipo = 'Pública';
  if(first === 10) tipo = 'Privada';
  if(first === 172 && p[1] >= 16 && p[1] <= 31) tipo = 'Privada';
  if(first === 192 && p[1] === 168) tipo = 'Privada';
  return { clase, tipo };
}

// HOSTS ÚTILES SEGÚN TUS REGLAS ESPECIALES
function computeUsableHosts(prefix) {
    if (prefix === 31) return 2;  // Obligatorio
    if (prefix === 32) return 1;  // Obligatorio

    return Math.pow(2, 32 - prefix) - 2;
}

// RANGO ÚTIL CON TUS REGLAS
function computeUsableRange(network, broadcast, prefix) {

    // /32 → rango = IP-IP
    if (prefix === 32) {
        return intToIp(network) + " - " + intToIp(network);
    }

    // /31 → rango = network-broadcast
    if (prefix === 31) {
        return intToIp(network) + " - " + intToIp(broadcast);
    }

    // Rangos normales
    let first = network + 1;
    let last = broadcast - 1;

    return intToIp(first) + " - " + intToIp(last);
}


// Ejecución de cuando se le da al boton de calcular
document.getElementById('calcBtn').addEventListener('click', ()=>{
  const ipStr = document.getElementById('ip').value.trim();
  const maskStr = document.getElementById('mask').value.trim();
  if(!ipStr && !maskStr){
    alert('Ingresa una IP y máscara (ej: 192.168.1.1 y 255.255.255.0 o /24)');
    return;
  }
  if(!ipStr){
    alert('Ingresa una IP (ej: 192.168.1.1)');
    return;
  }
  if(!maskStr){
    alert('Ingresa una máscara (ej: 255.255.255.0 o /24)');
    return;
  }

  const all = computeAll(ipStr, maskStr);
  if(all=="invalidBoth"){
    alert('La IP y la máscara son inválidas (los rangos son 0-255 para cada octeto y /0-32 para CIDR)');
    return;
  }
  if(all=="invalidIp"){
    alert('La IP es inválida (los rangos son 0-255 para cada octeto)');
    return;
  }
  if(all=="invalidMask"){
    alert('La máscara es inválida (los rangos son 0-255 para cada octeto o /0-32 para CIDR )');
    return;
  }
  if(!all){
    alert('IP o máscara inválida');
    return;
  }

  // Resultados
  document.getElementById('res-ip').innerText = ipStr;
  const mparts = [ (all.maskInt >>> 24) & 255, (all.maskInt >>> 16) & 255, (all.maskInt >>> 8) & 255, all.maskInt & 255 ];
  document.getElementById('res-mask').innerText = mparts.join('.') + ' (/' + all.prefix + ')';
  document.getElementById('res-network').innerText = intToIp(all.network);
  document.getElementById('res-broadcast').innerText = intToIp(all.broadcast);
  document.getElementById("res-hosts").innerText = computeUsableHosts(all.prefix);
  document.getElementById("res-range").innerText = computeUsableRange(all.network, all.broadcast, all.prefix);

  const cls = classifyIp(ipStr);
  document.getElementById('res-class').innerText = cls.clase;
  document.getElementById('res-private').innerText = cls.tipo;

  // Binarios
  const binIp = toBinaryDot(all.ip);
  const binMask = toBinaryDot(all.maskInt);
  const binNet = toBinaryDot(all.network);
  const binBc  = toBinaryDot(all.broadcast);

  document.getElementById('bin-mask').innerHTML = highlightBinaryBits(binMask, all.prefix);
  document.getElementById('bin-ip').innerHTML = highlightBinaryBits(binIp, all.prefix);
  document.getElementById('bin-network').innerHTML = highlightBinaryBits(binNet, all.prefix);
  document.getElementById('bin-broadcast').innerHTML = highlightBinaryBits(binBc, all.prefix);
});
