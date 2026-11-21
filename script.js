const total = 43;
const together = new Set([4, 5, 9, 13, 14, 15, 21, 26, 30]);
const adventures = new Set([3, 6, 7, 8, 11, 12, 16, 17, 18, 20, 22, 23, 24, 27]);
const family = new Set([29, 31, 32, 33, 34, 40, 41, 42]);
const categories = i => family.has(i) ? 'family' : together.has(i) ? 'together' : adventures.has(i) ? 'adventures' : 'her';
const photos = Array.from({length: total}, (_, j) => ({i: j + 1, src: `assets/foto-${String(j + 1).padStart(2, '0')}.jpg`, caption: `Nuestro recuerdo ${j + 1}`, category: categories(j + 1)}));
const $ = s => document.querySelector(s);
const gallery = $('#gallery');
let visiblePhotos = [...photos], current = 0, previousFocus = null;
function buildGallery(filter = 'all') {
    visiblePhotos = photos.filter(p => filter === 'all' || p.category === filter);
    gallery.innerHTML = '';
    visiblePhotos.forEach((p, j) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Ampliar fotografía ${p.i}`);
        const img = document.createElement('img');
        img.src = p.src;
        img.alt = `Recuerdo ${p.i} de nuestra historia`;
        img.loading = 'lazy';
        b.append(img);
        b.addEventListener('click', () => openPhoto(j));
        gallery.append(b)
    })
}
function fillGrid(id, ids) {
    const el = $(id);
    ids.forEach(i => {
        const img = document.createElement('img');
        img.src = photos[i - 1].src;
        img.alt = `Un momento especial de nuestra historia`;
        img.loading = 'lazy';
        el.append(img)
    })
}
fillGrid('#travel-grid', [6, 12, 16, 17, 18, 20, 22, 24]);
fillGrid('#baby-grid', [29, 32, 33, 34, 40, 41, 42, 31]);
buildGallery();
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildGallery(btn.dataset.filter)
    }));
function openPhoto(j) {
    previousFocus = document.activeElement;
    current = j;
    renderPhoto();
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#close-lightbox').focus()
}
function renderPhoto() {
    const p = visiblePhotos[current];
    $('#lightbox-img').src = p.src;
    $('#lightbox-img').alt = `Fotografía ${p.i}`;
    $('#lightbox-caption').textContent = `Recuerdo ${p.i} de ${total} ♡`
}
function movePhoto(delta) {
    current = (current + delta + visiblePhotos.length) % visiblePhotos.length;
    renderPhoto()
}
function closeModal(id) {
    $(id).hidden = true;
    document.body.style.overflow = '';
    previousFocus?.focus?.()
}
$('#close-lightbox').addEventListener('click', () => closeModal('#lightbox'));
$('#prev').addEventListener('click', () => movePhoto(-1));
$('#next').addEventListener('click', () => movePhoto(1));
$('#lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox')
        closeModal('#lightbox')
});
$('#begin').addEventListener('click', () => $('#historia').scrollIntoView({behavior: 'smooth'}));
$('#surprise').addEventListener('click', () => {
    previousFocus = document.activeElement;
    $('#surprise-modal').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#close-surprise').focus();
    burst(36)
});
$('#close-surprise').addEventListener('click', () => closeModal('#surprise-modal'));
$('#surprise-modal').addEventListener('click', e => {
    if (e.target.id === 'surprise-modal')
        closeModal('#surprise-modal')
});
$('#replay').addEventListener('click', () => {
    closeModal('#surprise-modal');
    window.scrollTo({top: 0, behavior: 'smooth'})
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (!$('#lightbox').hidden)
            closeModal('#lightbox');
        if (!$('#surprise-modal').hidden)
            closeModal('#surprise-modal')
    }
    if (!$('#lightbox').hidden) {
        if (e.key === 'ArrowRight')
            movePhoto(1);
        if (e.key === 'ArrowLeft')
            movePhoto(-1)
    }
});
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target)
        }
    }), {threshold: .12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#progress').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'
}
window.addEventListener('scroll', progress, {passive: true});
progress();
function burst(n = 18) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
    for (let i = 0; i < n; i++) {
        const el = document.createElement('span');
        el.className = 'floating-heart';
        el.textContent = Math.random() > .3 ? '♥' : '♡';
        el.style.setProperty('--left', Math.random() * 100 + '%');
        el.style.setProperty('--duration', 3 + Math.random() * 4 + 's');
        el.style.setProperty('--size', 14 + Math.random() * 25 + 'px');
        $('#hearts').append(el);
        el.addEventListener('animationend', () => el.remove())
}
}
let audioCtx = null, toneTimer = null, playing = false, step = 0;
const melody = [261.63, 329.63, 392, 523.25, 493.88, 392, 329.63, 293.66, 349.23, 440, 523.25, 587.33, 523.25, 440, 392, 329.63];
function note(freq) {
    if (!audioCtx)
        return;
    const now = audioCtx.currentTime, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.035, now + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .38);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + .4)
}


/*$('#sound').addEventListener('click', async() => {
    if (playing) {
        clearInterval(toneTimer);
        toneTimer = null;
        playing = false;
        $('#sound').textContent = '♫ Música: desactivada';
        return
    }
    try {
        audioCtx??=new (window.AudioContext || window.webkitAudioContext)();
        await audioCtx.resume();
        playing = true;
        $('#sound').textContent = '♫ Música: activada';
        note(melody[step++ % melody.length]);
        toneTimer = setInterval(() => note(melody[step++ % melody.length]), 460)
    } catch (e) {
        $('#sound').textContent = 'Audio no disponible'
    }
});*/


/* Música romántica de fondo */

const musica = new Audio("musica/greeicy-limonar.mp3");

musica.loop = true;
musica.volume = 0.35;

let reproduciendo = false;

document.getElementById("sound").addEventListener("click", async () => {
    const boton = document.getElementById("sound");

    if (reproduciendo) {
        musica.pause();
        reproduciendo = false;
        boton.textContent = "♫ Música: desactivada";
    } else {
        try {
            await musica.play();
            reproduciendo = true;
            boton.textContent = "♫ Música: activada";
        } catch (error) {
            console.error("No se pudo reproducir la música:", error);
        }
    }
});

(function () {
    const fechaObjetivo = new Date("2026-11-21T00:00:00-05:00");
    let intervalo = null;
    let desbloqueado = false;

    function actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = String(valor).padStart(2, "0");
        }
    }

    function desbloquear() {
        if (desbloqueado) return;

        desbloqueado = true;
        clearInterval(intervalo);

        const pantalla = document.getElementById("pantalla-espera");

        document.documentElement.classList.remove(
            "esperando-cumpleanos"
        );

        if (pantalla && !pantalla.hidden) {
            pantalla.classList.add("desapareciendo");

            setTimeout(() => {
                pantalla.hidden = true;
                pantalla.classList.remove("desapareciendo");
            }, 1300);
        }
    }

    function actualizarContador() {
        const diferencia = fechaObjetivo.getTime() - Date.now();

        if (diferencia <= 0) {
            desbloquear();
            return;
        }

        const dias = Math.floor(diferencia / 86400000);
        const horas = Math.floor((diferencia / 3600000) % 24);
        const minutos = Math.floor((diferencia / 60000) % 60);
        const segundos = Math.floor((diferencia / 1000) % 60);

        actualizarElemento("dias", dias);
        actualizarElemento("horas", horas);
        actualizarElemento("minutos", minutos);
        actualizarElemento("segundos", segundos);
    }

    function iniciarCuentaRegresiva() {
        const pantalla = document.getElementById("pantalla-espera");

        if (Date.now() >= fechaObjetivo.getTime()) {
            desbloquear();
            return;
        }

        if (!pantalla) return;

        pantalla.hidden = false;

        document.documentElement.classList.add(
            "esperando-cumpleanos"
        );

        actualizarContador();

        intervalo = setInterval(actualizarContador, 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarCuentaRegresiva
        );
    } else {
        iniciarCuentaRegresiva();
    }
})();

(function () {
    const bienvenida = document.getElementById("bienvenida-musica");

    const botonActivar = document.getElementById(
        "activar-musica-inicio"
    );

    const botonOmitir = document.getElementById(
        "omitir-musica-inicio"
    );

    const botonMusicaOriginal = document.getElementById("sound");

    if (!bienvenida || !botonActivar || !botonOmitir) return;

    let finalizada = false;

    function cerrarBienvenida() {
        if (finalizada) return;

        finalizada = true;

        bienvenida.classList.add("ocultando");

        setTimeout(() => {
            bienvenida.hidden = true;
            bienvenida.style.display = "none";

            document.documentElement.classList.remove(
                "bienvenida-pendiente"
            );
        }, 800);
    }

    botonActivar.addEventListener("click", () => {

        if (botonMusicaOriginal) {
            botonMusicaOriginal.click();
        }

        cerrarBienvenida();
    });

    botonOmitir.addEventListener("click", () => {
        cerrarBienvenida();
    });
})();
