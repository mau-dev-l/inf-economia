// js/04_radio.js

let modoDibujoActivo = false;
let circuloActual = null;

document.addEventListener('DOMContentLoaded', function() {
    
    const btnRadio = document.getElementById('btnRadioInfluencia');
    const inputMetros = document.getElementById('inputRadioMetros');

    // 1. Activar/Desactivar Modo Dibujo
    if (btnRadio) {
        btnRadio.addEventListener('click', function() {
            modoDibujoActivo = !modoDibujoActivo; 
            
            if (modoDibujoActivo) {
                // Cambio visual del botón
                btnRadio.classList.replace('btn-outline-primary', 'btn-primary');
                btnRadio.innerHTML = '🛑 Cancelar';
                document.getElementById('map').style.cursor = 'crosshair'; 
                
                // Limpiamos selecciones previas para evitar conflictos
                if(document.getElementById('cmbCentralidad')) {
                    document.getElementById('cmbCentralidad').value = "";
                }
                window.resetearUI_Global();
            } else {
                desactivarModoDibujo();
            }
        });
    }

    // 2. Evento Clic en el Mapa (Donde ocurre la magia)
    map.on('click', async function(e) {
        if (!modoDibujoActivo) return;

        // Limpiar dibujos previos
        if (window.capaDibujo) window.capaDibujo.clearLayers();
        window.resetearUI_Global(); 

        const radioMetros = parseInt(inputMetros.value) || 500;
        const centro = e.latlng;

        console.log(`📍 Análisis de Radio: ${radioMetros}m en [${centro.lat}, ${centro.lng}]`);

        // A. Dibujar Círculo Visual en el Mapa
        circuloActual = L.circle(centro, {
            color: '#0d6efd',    // Azul Bootstrap
            fillColor: '#0d6efd',
            fillOpacity: 0.15,
            weight: 2,
            radius: radioMetros
        }).addTo(window.capaDibujo || map);

        map.fitBounds(circuloActual.getBounds());

        // B. Crear Polígono Matemático (Turf.js) para análisis espacial
        const radioKm = radioMetros / 1000;
        const centroGeoJSON = [centro.lng, centro.lat];
        const poligonoTurf = turf.circle(centroGeoJSON, radioKm, { steps: 64, units: 'kilometers' });

        // C. Ejecutar Análisis de Datos
        await ejecutarAnalisisRadio(poligonoTurf);
        
        // D. Desactivar modo dibujo automáticamente (opcional, por usabilidad)
        desactivarModoDibujo();
    });

    function desactivarModoDibujo() {
        modoDibujoActivo = false;
        btnRadio.classList.replace('btn-primary', 'btn-outline-primary');
        btnRadio.innerHTML = 'Radio';
        document.getElementById('map').style.cursor = '';
    }
});

async function ejecutarAnalisisRadio(poligonoTurf) {
    // Mostrar Loader
    const panelDemo = document.getElementById('panelDemografico');
    const loader = document.getElementById('loader-overlay');
    if(panelDemo) panelDemo.classList.remove('d-none');
    if(loader) loader.style.display = 'block';

    try {
        const bbox = turf.bbox(poligonoTurf).join(',');

        // --- 1. ANÁLISIS CENSAL (Población) ---
        // Usamos window.getDatosCenso para asegurar acceso global
        let pobTotal = 0, h = 0, m = 0, v = 0;

        if (typeof window.getDatosCenso === 'function') {
            const dataCenso = await window.getDatosCenso(bbox);
            
            if (dataCenso && dataCenso.features) {
                dataCenso.features.forEach(manzana => {
                    // Sumar solo si la manzana toca el círculo
                    if (turf.booleanIntersects(manzana, poligonoTurf)) {
                        pobTotal += (manzana.properties.pobtot || 0);
                        h += (manzana.properties.pobmas || 0);
                        m += (manzana.properties.pobfem || 0);
                        v += (manzana.properties.vivtot || 0);
                    }
                });
            }
        } else {
            console.warn("⚠️ Función getDatosCenso no encontrada.");
        }

        // Actualizar Textos
        window.actualizarDato('valPoblacion', pobTotal);
        window.actualizarDato('valHombres', h);
        window.actualizarDato('valMujeres', m);
        window.actualizarDato('valViviendas', v);

        // --- 2. ANÁLISIS DE NEGOCIOS (DENUE) ---
        const panelTemas = document.getElementById('panelTematicas');
        if(panelTemas) panelTemas.classList.remove('disabled-panel');
        
        const response = await fetch(`${window.API_URL}/denue/?in_bbox=${bbox}`);
        const dataNegocios = await response.json();

        // Filtro fino: Solo los que caen DENTRO del círculo
        const negociosDentro = dataNegocios.features.filter(punto => {
            return turf.booleanPointInPolygon(punto, poligonoTurf);
        });

        // Actualizar Mapa y Memoria
        window.datosPuntosMemoria = { type: "FeatureCollection", features: negociosDentro };
        window.redibujarPuntos();

        // --- 3. ACTUALIZAR GRÁFICAS (¡Esto faltaba!) ---
        if (typeof window.actualizarGraficas === 'function') {
            window.actualizarGraficas(h, m, negociosDentro);
        }

    } catch (error) {
        console.error("❌ Error en análisis de radio:", error);
        alert("Ocurrió un error al calcular los datos del radio.");
    } finally {
        // Ocultar Loader siempre, haya error o no
        if(loader) loader.style.display = 'none';
    }
}