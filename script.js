/* ==================================================
   ANNEAUX INTERACTIFS — LIQUID GEL
   ================================================== */

   /*partie créée par l'ia purement graphique*/

const zone = document.querySelector(".partie1");
const cercle = document.querySelector(".Cercle");

if (zone && cercle) {

    /* 01 — PARAMÈTRES PHYSIQUES */

    const elasticite = 95;
    const amortissement = 5;
    const puissance = 45;
    const souplesse = 125;
    const deformationMax = 0.14;
    const stabiliteCentre = 0.50;


    /* 02 — VARIABLES DE POSITION ET DE VITESSE */

    let x = 0;
    let y = 0;

    let vx = 0;
    let vy = 0;

    let cibleX = 0;
    let cibleY = 0;

    let frame = 0;
    let derniereImage = 0;


    /* 03 — DÉTECTION DE LA SOURIS */

    zone.addEventListener("pointermove", (event) => {

        // Désactive l'effet sur les écrans tactiles
        if (event.pointerType === "touch") return;

        // Respecte les préférences d'accessibilité
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const rect = zone.getBoundingClientRect();

        // Calcul du centre du cercle
        const centreX = rect.left + zone.clientLeft
            + cercle.offsetLeft + cercle.offsetWidth / 2;

        const centreY = rect.top + zone.clientTop
            + cercle.offsetTop + cercle.offsetHeight / 2;

        // Distance entre la souris et le centre
        const dx = centreX - event.clientX;
        const dy = centreY - event.clientY;

        const distance = Math.hypot(dx, dy);
        const rayon = cercle.offsetWidth / 2 + 144;


        /* 04 — STABILISATION AU CENTRE */

        const t = Math.min(
            1,
            distance / Math.max(
                1, cercle.offsetWidth * stabiliteCentre
            )
        );

        // Transition progressive (Smoothstep)
        const transition = t * t * (3 - 2 * t);

        // Force de répulsion de la souris
        const force = Math.max(
            0, 1 - distance / rayon
        ) * puissance * transition;

        const stabilite = Math.hypot(
            distance,
            Math.max(16, cercle.offsetWidth * 0.1)
        );

        cibleX = dx / stabilite * force;
        cibleY = dy / stabilite * force;

        demarrer();
    });


    /* 05 — RETOUR À LA POSITION INITIALE */

    zone.addEventListener("pointerleave", () => {

        cibleX = 0;
        cibleY = 0;

        demarrer();
    });


    /* 06 — DÉMARRAGE DE L'ANIMATION */

    function demarrer() {

        if (!frame) {
            frame = requestAnimationFrame(animer);
        }
    }


    /* 07 — SIMULATION PHYSIQUE DU RESSORT */

    function animer(temps) {

        const dt = derniereImage
            ? Math.min((temps - derniereImage) / 1000, 0.032)
            : 1 / 60;

        derniereImage = temps;

        // Force de rappel élastique
        vx += (cibleX - x) * elasticite * dt;
        vy += (cibleY - y) * elasticite * dt;

        // Amortissement progressif des rebonds
        vx *= Math.exp(-amortissement * dt);
        vy *= Math.exp(-amortissement * dt);

        // Actualisation de la position
        x += vx * dt;
        y += vy * dt;

        const mouvement =
            Math.hypot(cibleX - x, cibleY - y) > 0.1 ||
            Math.hypot(vx, vy) > 0.1;

        if (!mouvement) {
            x = cibleX;
            y = cibleY;
            vx = vy = 0;
        }


        /* 08 — DÉFORMATION SANS ROTATION */

        const amplitude = Math.hypot(x, y);

        const deformation = Math.min(
            deformationMax,
            amplitude / souplesse
        );

        const directionX = amplitude
            ? (x * x) / (amplitude * amplitude)
            : 0;

        const directionY = amplitude
            ? (y * y) / (amplitude * amplitude)
            : 0;

        const echelleX = 1
            - deformation * directionX
            + deformation * directionY * 0.7;

        const echelleY = 1
            - deformation * directionY
            + deformation * directionX * 0.7;

        cercle.style.transform = `
            translate(${x}px, ${y}px)
            scale(${echelleX}, ${echelleY})
        `;


        /* 09 — OPTIMISATION DES PERFORMANCES */

        // Arrête les calculs lorsque le cercle est immobile
        if (mouvement) {
            frame = requestAnimationFrame(animer);
        } else {
            frame = 0;
            derniereImage = 0;
        }
    }
}