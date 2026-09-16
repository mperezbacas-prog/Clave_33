document.addEventListener("DOMContentLoaded", function () {
  menuResponsive();
  submenuDesplegable();
  efectoDescifrado();
  claveDeLaNoche();
  candado();
  ruedaCesar();
  trivia();
  estadoLlaves();
  secretoFueraDeCarta();
  galeria();
  formularioContacto();
  anioActual();
});

function menuResponsive() {
  var boton = document.querySelector("#menuBoton");
  var nav = document.querySelector("#menuPrincipal");
  if (!boton || !nav) return;

  boton.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
}

function submenuDesplegable() {
  var toggles = document.querySelectorAll(".nav__toggle");

  toggles.forEach(function (toggle) {
    var item = toggle.closest(".nav__item");

    toggle.addEventListener("click", function () {
      var abierto = item.classList.toggle("abierto");
      toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".nav__item")) return;
    cerrarSubmenus();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarSubmenus();
  });

  function cerrarSubmenus() {
    document.querySelectorAll(".nav__item.abierto").forEach(function (item) {
      item.classList.remove("abierto");
      var t = item.querySelector(".nav__toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }
}

//JUEGO
var SIMBOLOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&·";

function descifrar(el, texto) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = texto;
    return;
  }

  var paso = 0;
  var reloj = setInterval(function () {
    var salida = "";

    for (var i = 0; i < texto.length; i++) {
      if (i < paso) {
        salida += texto[i];
      } else if (texto[i] === " ") {
        salida += " ";
      } else {
        salida += SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
      }
    }

    el.textContent = salida;
    paso += 0.6;

    if (paso > texto.length) clearInterval(reloj);
  }, 38);
}

function efectoDescifrado() {
  document.querySelectorAll("[data-descifrar]").forEach(function (el) {
    descifrar(el, el.dataset.descifrar);
  });
}

//JUEGO PALABRA CLAVE 
function claveDeLaNoche() {
  var form = document.querySelector("#formClave");
  if (!form) return;

  var entrada = document.querySelector("#claveEntrada");
  var respuesta = document.querySelector("#claveRespuesta");
  var boton = form.querySelector("button");
  var CLAVE = "rubi"; 

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var dicho = entrada.value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");   // saca los acentos

    if (dicho === CLAVE) {
      respuesta.classList.remove("respuesta--error");
      respuesta.textContent =
        "Rubí. Por el costado, puerta del fondo. Guarde la palabra, le van a volver a preguntar.";
    } else {
      respuesta.classList.add("respuesta--error");
      respuesta.textContent = "Esta noche mide el tiempo desde la vereda.";
    }

    cerrar();
  });

  function cerrar() {
    entrada.value = "";
    entrada.disabled = true;
    entrada.placeholder = "";
    boton.disabled = true;
    boton.textContent = "Ya habló";
  }
}

var ALMACEN = "clave33.llaves";
var llavesEnMemoria = {};

function leerLlaves() {
  try {
    return JSON.parse(localStorage.getItem(ALMACEN)) || {};
  } catch (e) {
    return llavesEnMemoria;
  }
}

function tieneLlave(nombre) {
  return leerLlaves()[nombre] === true;
}

function guardarLlave(nombre) {
  var llaves = leerLlaves();
  llaves[nombre] = true;
  llavesEnMemoria = llaves;
  try {
    localStorage.setItem(ALMACEN, JSON.stringify(llaves));
  } catch (e) {}
}

function borrarLlaves() {
  llavesEnMemoria = {};
  try {
    localStorage.removeItem(ALMACEN);
  } catch (e) {}
}

function candado() {
  var zona = document.querySelector("[data-protegido]");
  var caja = document.querySelector("#candado");
  if (!zona || !caja) return;

  var llave = zona.dataset.protegido;

  if (tieneLlave(llave)) abrirZona(false);

  var saltear = document.querySelector("#saltear");
  if (saltear) {
    saltear.addEventListener("click", function () {
      guardarLlave(llave);
      abrirZona(true);
    });
  }

  var cerrar = document.querySelector("#volverACerrar");
  if (cerrar) {
    cerrar.addEventListener("click", function () {
      borrarLlaves();
      window.location.reload();
    });
  }

  window.abrirCandado = function () {
    guardarLlave(llave);
    abrirZona(true);
  };

  function abrirZona(animar) {
    caja.hidden = true;
    zona.hidden = false;

    if (animar) {
      zona.querySelectorAll("[data-descifrar]").forEach(function (el) {
        descifrar(el, el.dataset.descifrar);
      });
      zona.scrollIntoView({ behavior: "smooth", block: "start" });
      secretoFueraDeCarta();   // por si la última llave era esta
    }
  }
}

// JUEGO RUEDA CESAR
function ruedaCesar() {
  var dial = document.querySelector("#dial");
  if (!dial) return;

  var disco = document.querySelector("#dialDisco");
  var salida = document.querySelector("#ruedaTexto");
  var numero = document.querySelector("#ruedaNumero");
  var aviso = document.querySelector("#ruedaAviso");
  var boton = document.querySelector("#ruedaBoton");

  var CIFRADO = "SH JHZH SV LZAHIH LZWLYHUKV";
  var META = 33;  // vueltas de cuerda que abren la puerta
  var TOPE = 52;  // dos vueltas completas de la rueda
  var PASO = 360 / 26;

  var angulo = 0;                
  var vueltas = 0;
  var arrastrando = false;
  var anguloPrevio = 0;

  function anguloDe(e) {
    var caja = dial.getBoundingClientRect();
    var x = e.clientX - (caja.left + caja.width / 2);
    var y = e.clientY - (caja.top + caja.height / 2);
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  dial.addEventListener("pointerdown", function (e) {
    e.preventDefault()  // PARA MOBIL
    arrastrando = true;
    anguloPrevio = anguloDe(e);
    disco.style.transition = "none";
    dial.setPointerCapture(e.pointerId);
  });

  dial.addEventListener("pointermove", function (e) {
    if (!arrastrando) return;
    e.preventDefault();

    var actual = anguloDe(e);
    var delta = actual - anguloPrevio;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    anguloPrevio = actual;

    girar(angulo + delta);
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (evento) {
    dial.addEventListener(evento, function () {
      if (!arrastrando) return;
      arrastrando = false;
      disco.style.transition = "";
      girar(vueltas * PASO);
    });
  });

  dial.addEventListener("keydown", function (e) {
    var teclas = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (teclas[e.key]) {
      e.preventDefault();
      girar((vueltas + teclas[e.key]) * PASO);
    } else if (e.key === "Home") {
      e.preventDefault();
      girar(0);
    }
  });

  document.querySelector("#dialMas").addEventListener("click", function () {
    girar((vueltas + 1) * PASO);
  });
  document.querySelector("#dialMenos").addEventListener("click", function () {
    girar((vueltas - 1) * PASO);
  });

  boton.addEventListener("click", function () { window.abrirCandado(); });

  function girar(nuevoAngulo) {
    angulo = Math.max(0, Math.min(nuevoAngulo, TOPE * PASO));
    vueltas = Math.round(angulo / PASO);
    disco.style.transform = "rotate(" + angulo + "deg)";
    pintar();
  }

  function pintar() {
    numero.textContent = vueltas;
    salida.textContent = correr(CIFRADO, vueltas % 26);

    dial.setAttribute("aria-valuenow", vueltas);
    dial.setAttribute("aria-valuetext", vueltas + " vueltas");

    if (vueltas === META) {
      aviso.textContent = "La cuerda llegó al final. La puerta cede.";
      boton.hidden = false;
    } else if (vueltas % 26 === META % 26) {
      // se lee, pero todavía le falta cuerda
      aviso.textContent = "Se entiende, pero la puerta no se mueve. Falta cuerda.";
      boton.hidden = true;
    } else {
      aviso.textContent = "";
      boton.hidden = true;
    }
  }

  function correr(texto, n) {
    var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var resultado = "";

    for (var i = 0; i < texto.length; i++) {
      var pos = abc.indexOf(texto[i]);
      if (pos === -1) {
        resultado += texto[i];
      } else {
        resultado += abc[(pos - n + 26) % 26];
      }
    }
    return resultado;
  }

  pintar();
}

//JUEGO UBICACION
function trivia() {
  var bloque = document.querySelector("#trivia");
  if (!bloque) return;

  var preguntas = Array.prototype.slice.call(bloque.querySelectorAll(".pregunta"));
  var resueltas = 0;
  var errores = 0;
  var AVISOS = [
    "Casi. Casi no sirve acá.",
    "Otra vez, con más atención.",
    "Insista. No siempre es buena idea, pero insista."
  ];

  preguntas.forEach(function (pregunta) {
    var opciones = pregunta.querySelectorAll(".opcion");
    var aviso = pregunta.querySelector(".pregunta__aviso");
    var premio = pregunta.querySelector(".pregunta__premio");

    opciones.forEach(function (opcion) {
      opcion.addEventListener("click", function () {
        if (pregunta.classList.contains("resuelta")) return;

        if (opcion.dataset.correcta === "si") {
          pregunta.classList.add("resuelta");
          opcion.classList.add("opcion--correcta");
          opciones.forEach(function (o) { o.disabled = true; });

          aviso.textContent = "";
          premio.hidden = false;
          descifrar(premio, premio.dataset.descifrar);

          resueltas++;
          if (resueltas === preguntas.length) {
            setTimeout(function () { window.abrirCandado(); }, 1600);
          }
        } else {
          opcion.classList.add("opcion--mal");
          aviso.textContent = AVISOS[errores % AVISOS.length];
          errores++;
        }
      });
    });
  });
}

function estadoLlaves() {
  var tarjetas = document.querySelectorAll("[data-llave]");
  if (!tarjetas.length) return;

  tarjetas.forEach(function (tarjeta) {
    var abierta = tieneLlave(tarjeta.dataset.llave);
    var estado = tarjeta.querySelector(".llave__estado");
    tarjeta.classList.toggle("llave--abierta", abierta);
    estado.textContent = abierta ? "Resuelto" : "Cerrado";
  });

  var reiniciar = document.querySelector("#reiniciar");
  if (reiniciar) {
    reiniciar.addEventListener("click", function () {
      borrarLlaves();
      window.location.reload();
    });
  }
}
//ASMODEO 1800
function secretoFueraDeCarta() {
  var secreto = document.querySelector("#secreto");
  if (!secreto) return;

  if (tieneLlave("carta") && tieneLlave("ubicacion")) {
    secreto.classList.remove("secreto--cerrado");
    descifrar(secreto, "PEDIME EL ASMODEO 1800");
  } else {
    secreto.textContent = "· · · te falta una llave · · ·";
    secreto.classList.add("secreto--cerrado");
  }
}

function galeria() {
  var lista = document.querySelector("#galeria");
  if (!lista) return;

  var items = Array.prototype.slice.call(lista.querySelectorAll("li"));
  var filtros = document.querySelectorAll(".filtro");
  var visor = document.querySelector("#visor");
  var visorImg = document.querySelector("#visorImg");
  var visorPie = document.querySelector("#visorPie");
  var indice = 0;
  var visibles = items;

  filtros.forEach(function (boton) {
    boton.addEventListener("click", function () {
      var tipo = boton.dataset.filtro;

      filtros.forEach(function (b) { b.classList.remove("activo"); });
      boton.classList.add("activo");

      items.forEach(function (li) {
        var muestra = tipo === "todo" || li.dataset.categoria === tipo;
        li.hidden = !muestra;
      });

      visibles = items.filter(function (li) { return !li.hidden; });
    });
  });

  lista.addEventListener("click", function (e) {
    var boton = e.target.closest(".galeria__boton");
    if (!boton) return;
    indice = visibles.indexOf(boton.closest("li"));
    mostrar();
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";  
    document.querySelector("#visorCerrar").focus();
  });

  function mostrar() {
    var li = visibles[indice];
    var img = li.querySelector("img");
    visorImg.src = img.src;
    visorImg.alt = img.alt;
    visorPie.textContent =
      li.querySelector(".galeria__pie").textContent +
      "  ·  " + (indice + 1) + " de " + visibles.length;
  }

  function mover(paso) {
    indice = (indice + paso + visibles.length) % visibles.length;
    mostrar();
  }

  function cerrar() {
    visor.classList.remove("abierto");
    document.body.style.overflow = "";
  }

  document.querySelector("#visorCerrar").addEventListener("click", cerrar);
  document.querySelector("#visorAnterior").addEventListener("click", function () { mover(-1); });
  document.querySelector("#visorSiguiente").addEventListener("click", function () { mover(1); });

  visor.addEventListener("click", function (e) {
    if (e.target === visor) cerrar();
  });

  document.addEventListener("keydown", function (e) {
    if (!visor.classList.contains("abierto")) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowLeft") mover(-1);
    if (e.key === "ArrowRight") mover(1);
  });
}

function formularioContacto() {
  var form = document.querySelector("#formContacto");
  if (!form) return;

  var aviso = document.querySelector("#avisoEnviado");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    //ERROR IF NULL
    var reglas = [
      ["nombre", function (v) { return v.trim().length >= 3; },
        "Escribí tu nombre completo (mínimo 3 letras)."],
      ["email", function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
        "Revisá el correo: falta el @ o el dominio."],
      ["personas", function (v) { return v === "" || (Number(v) >= 1 && Number(v) <= 12); },
        "Aceptamos mesas de 1 a 12 personas."],
      ["motivo", function (v) { return v !== ""; },
        "Elegí un motivo."],
      ["mensaje", function (v) { return v.trim().length >= 10; },
        "Contanos un poco más: al menos 10 caracteres."]
    ];

    reglas.forEach(function (regla) {
      var campo = form.elements[regla[0]];
      var valido = regla[1](campo.value);
      marcar(campo, valido, regla[2]);
      if (!valido) ok = false;
    });

    var acepta = form.elements["acepta"];
    marcar(acepta, acepta.checked, "Necesitamos tu confirmación para responderte.");
    if (!acepta.checked) ok = false;

    if (!ok) {
      aviso.classList.remove("visible");
      var primerError = form.querySelector('[aria-invalid="true"]');
      if (primerError) primerError.focus();
      return;
    }

    aviso.classList.add("visible");
    aviso.setAttribute("tabindex", "-1");
    aviso.focus();
    form.reset();
  });

  function marcar(campo, valido, mensaje) {
    var salida = document.querySelector("#error-" + campo.name);
    campo.setAttribute("aria-invalid", valido ? "false" : "true");
    if (salida) salida.textContent = valido ? "" : mensaje;
  }
}

//aparentemente esto actualiza la pagina al año actual, volveré en unos meses
function anioActual() {
  document.querySelectorAll(".anio").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
}
