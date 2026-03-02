export function soloDigitos(valor = "") {
  return String(valor).replace(/\D/g, "");
}

export function formatearCedula(valor = "") {
  const digitos = soloDigitos(valor).slice(0, 11);
  const p1 = digitos.slice(0, 3);
  const p2 = digitos.slice(3, 10);
  const p3 = digitos.slice(10, 11);

  if (digitos.length <= 3) return p1;
  if (digitos.length <= 10) return `${p1}-${p2}`;
  return `${p1}-${p2}-${p3}`;
}

export function formatearRnc(valor = "") {
  const digitos = soloDigitos(valor).slice(0, 9);
  const p1 = digitos.slice(0, 1);
  const p2 = digitos.slice(1, 3);
  const p3 = digitos.slice(3, 8);
  const p4 = digitos.slice(8, 9);

  if (digitos.length <= 1) return p1;
  if (digitos.length <= 3) return `${p1}-${p2}`;
  if (digitos.length <= 8) return `${p1}-${p2}-${p3}`;
  return `${p1}-${p2}-${p3}-${p4}`;
}

export function validarCedulaDominicana(valor = "") {
  const digitos = soloDigitos(valor);
  if (!/^\d{11}$/.test(digitos)) return false;
  if (/^0{11}$/.test(digitos)) return false;

  let suma = 0;
  for (let i = 0; i < 10; i += 1) {
    const n = Number(digitos[i]);
    const mult = i % 2 === 0 ? 1 : 2;
    const prod = n * mult;
    suma += prod < 10 ? prod : Math.floor(prod / 10) + (prod % 10);
  }

  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(digitos[10]);
}

export function validarRncDominicano(valor = "") {
  const digitos = soloDigitos(valor);
  if (!/^\d{9}$/.test(digitos)) return false;
  if (/^0{9}$/.test(digitos)) return false;

  const pesos = [7, 9, 8, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i += 1) {
    suma += Number(digitos[i]) * pesos[i];
  }

  const resto = suma % 11;
  let verificador = 11 - resto;
  if (verificador === 10) verificador = 1;
  if (verificador === 11) verificador = 2;

  return verificador === Number(digitos[8]);
}
