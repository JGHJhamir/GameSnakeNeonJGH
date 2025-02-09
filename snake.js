//@JGHJhamir

//Elementos de Interfaz y Configuración Inicial
const lienzo = document.getElementById('lienzoJuego');
const ctx = lienzo.getContext('2d');
const btnJugarPausar = document.getElementById('btnJugarPausar');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnSalirModo = document.getElementById('btnSalirModo');
const contadorComidaElemento = document.getElementById('contadorComida');
const seleccionModo = document.getElementById('seleccionModo');
const contenedorJuego = document.getElementById('contenedorJuego');
// Manejo de la Música de Fondo
const backgroundMusic = document.getElementById('background-music');
const btnMusica = document.getElementById('btnMusica');
let musicaReproduciendo = false;

function alternarMusica() {
    if (musicaReproduciendo) {
        backgroundMusic.pause();
        btnMusica.textContent = '🚫';
    } else {
        backgroundMusic.play().catch(error => {
            console.log("Error al intentar reproducir el audio: ", error);
        });
        btnMusica.textContent = '🔈';
    }
    musicaReproduciendo = !musicaReproduciendo;
}

btnMusica.addEventListener('click', alternarMusica);

// Configuración inicial del juego
const tamanoCuadro = 20;
const anchoLienzo = 520;
const altoLienzo = 400;
lienzo.width = anchoLienzo;
lienzo.height = altoLienzo;
const anchoCuadricula = anchoLienzo / tamanoCuadro;
const altoCuadricula = altoLienzo / tamanoCuadro;

// Lógica del Juego
let serpiente = [{ x: tamanoCuadro * 5, y: tamanoCuadro * 5 }]; 
let direccion = { x: tamanoCuadro, y: 0 }; 
let comida = obtenerPosicionAleatoriaComida(); 
let puntuacion = 0;
let velocidadBase = 200; 
let velocidadJuego = velocidadBase;
let intervaloJuego;
let estaPausado = true;
let modoJuego = 'infinito';
let tiempoInicio = 0;
const intervaloAumentoVelocidad = 10000; 
let cuadroAnimacionComida = 0;
const intervaloAnimacionComida = 200;
let particulas = []; 
let juegoTerminado = false;

const sonidoComer = new Audio('Blop.mp3');
const sonidoColision = new Audio('colision.mp3');

// Funcion y Animación
function obtenerPosicionAleatoriaComida() {
    let posicion;
    do {
        posicion = {
            x: Math.floor(Math.random() * (anchoCuadricula - 2)) * tamanoCuadro + tamanoCuadro,
            y: Math.floor(Math.random() * (altoCuadricula - 2)) * tamanoCuadro + tamanoCuadro,
        };
    } while (serpiente.some(segmento => segmento.x === posicion.x && segmento.y === posicion.y));
    return posicion;
}
function dibujarCirculo(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + tamanoCuadro / 2, y + tamanoCuadro / 2, tamanoCuadro / 2, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarRectangulo(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, tamanoCuadro, tamanoCuadro);
}

function dibujarMuros() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = tamanoCuadro;
    ctx.strokeRect(tamanoCuadro / 2, tamanoCuadro / 2, lienzo.width - tamanoCuadro, lienzo.height - tamanoCuadro);
}

// Función principal que dibuja el juego en cada frame
function dibujar() {
    if (juegoTerminado) return;

    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    dibujarParticulas();

    dibujarCirculo(comida.x, comida.y, cuadroAnimacionComida % 2 === 0 ? '#ff4444' : '#ff5555');

    dibujarMuros();
    function dibujarMuros() {
    ctx.strokeStyle = '#1b2430'; // Cambia '#FF0000' al color que prefieras
    ctx.lineWidth = tamanoCuadro;
    ctx.strokeRect(tamanoCuadro / 2, tamanoCuadro / 2, lienzo.width - tamanoCuadro, lienzo.height - tamanoCuadro);
}

    // Dibujar la serpiente
    serpiente.forEach((segmento, indice) => {
        let color = indice === 0 ? '#00ffff' : '#007777'; 
        dibujarRectangulo(segmento.x, segmento.y, color);
    });

    const cabeza = { x: serpiente[0].x + direccion.x, y: serpiente[0].y + direccion.y };

    if (
        cabeza.x < tamanoCuadro || cabeza.x >= lienzo.width - tamanoCuadro ||
        cabeza.y < tamanoCuadro || cabeza.y >= lienzo.height - tamanoCuadro ||
        serpiente.slice(1).some(segmento => segmento.x === cabeza.x && segmento.y === cabeza.y)
    ) {
        if (!juegoTerminado) {
            sonidoColision.play(); 
            generarParticulas(cabeza.x, cabeza.y);
            setTimeout(() => {
                alert(`JAJAJAJJAJAJAJAJJAJAJAJAJAJAJA
                    PERDISTEEEEEEEEEEEEEEEEEEEEEEEEEEE
                    😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂
                    PUNTOS: ${puntuacion}`);
                reiniciarJuego();
            }, 500);
            juegoTerminado = true;
        }
        return;
    }

    serpiente.unshift(cabeza); 

    if (cabeza.x === comida.x && cabeza.y === comida.y) {
        puntuacion++;
        sonidoComer.play(); 
        generarParticulas(comida.x, comida.y);
        comida = obtenerPosicionAleatoriaComida(); 
        contadorComidaElemento.textContent = puntuacion; 
    } else {
        serpiente.pop();
    }

    cuadroAnimacionComida++;

    // Aumentar la velocidad en el modo velocidaD
    if (modoJuego === 'velocidad') {
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        if (tiempoTranscurrido > intervaloAumentoVelocidad) {
            velocidadJuego = Math.max(50, velocidadJuego - 10);
            clearInterval(intervaloJuego);
            intervaloJuego = setInterval(dibujar, velocidadJuego);
            tiempoInicio = Date.now();
        }
    }
}

// Generar partículas 
function generarParticulas(x, y) {
    for (let i = 0; i < 10; i++) {
        particulas.push({
            x: x + tamanoCuadro / 2,
            y: y + tamanoCuadro / 2,
            radio: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            vida: 90
        });
    }
}
function dibujarParticulas() {
    particulas.forEach((particula, indice) => {
        if (particula.vida > 0) {
            ctx.beginPath();
            ctx.arc(particula.x, particula.y, particula.radio, 0, Math.PI * 2);
            ctx.fillStyle = particula.color;
            ctx.fill();
            particula.x += particula.dx;
            particula.y += particula.dy;
            particula.vida--;
        } else {
            particulas.splice(indice,       1);
        }
    });
}

// Manejar las teclas de direccionales
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && direccion.y === 0) {
        direccion = { x: 0, y: -tamanoCuadro };
    } else if (event.key === 'ArrowDown' && direccion.y === 0) {
        direccion = { x: 0, y: tamanoCuadro };
    } else if (event.key === 'ArrowLeft' && direccion.x === 0) {
        direccion = { x: -tamanoCuadro, y: 0 };
    } else if (event.key === 'ArrowRight' && direccion.x === 0) {
        direccion = { x: tamanoCuadro, y: 0 };
    }
});

// Funcion para los botones
btnJugarPausar.addEventListener('click', () => {
    if (estaPausado) {
        iniciarJuego();
    } else {
        pausarJuego();
    }
});

function iniciarJuego() {
    estaPausado = false;
    juegoTerminado = false;
    btnJugarPausar.textContent = 'Pausar';
    tiempoInicio = Date.now();
    intervaloJuego = setInterval(dibujar, velocidadJuego);
}

function pausarJuego() {
    estaPausado = true;
    clearInterval(intervaloJuego);
    btnJugarPausar.textContent = 'Jugar';
}

btnReiniciar.addEventListener('click', () => {
    reiniciarJuego();
});

function reiniciarJuego() {
    clearInterval(intervaloJuego);
    serpiente = [{ x: tamanoCuadro * 5, y: tamanoCuadro * 5 }];
    direccion = { x: tamanoCuadro, y: 0 };
    comida = obtenerPosicionAleatoriaComida();
    puntuacion = 0;
    contadorComidaElemento.textContent = puntuacion;
    velocidadJuego = velocidadBase;
    juegoTerminado = false;
    iniciarJuego();
}

btnSalirModo.addEventListener('click', () => {
    pausarJuego();
    seleccionModo.style.display = 'block';
    contenedorJuego.style.display = 'none';
});

// Selección de modos de juego

document.getElementById('btnModoInfinito').addEventListener('click', () => {
    seleccionModo.style.display = 'none';
    contenedorJuego.style.display = 'block';
    modoJuego = 'infinito';
    velocidadJuego = velocidadBase;
    iniciarJuego();
});

document.getElementById('btnModoVelocidad').addEventListener('click', () => {
    seleccionModo.style.display = 'none';
    contenedorJuego.style.display = 'block';
    modoJuego = 'velocidad';
    velocidadJuego = velocidadBase;
    iniciarJuego();
});