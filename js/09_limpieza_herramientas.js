// core/static/core/js/09_limpieza_herramientas.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LIMPIEZA DE RADIO DE INFLUENCIA ---
    const btnLimpiarRadio = document.getElementById('btnLimpiarRadio');
    const inputRadio = document.getElementById('inputRadioMetros');

    if (btnLimpiarRadio) {
        btnLimpiarRadio.addEventListener('click', function() {
            // Restaurar valor por defecto (500m)
            if(inputRadio) inputRadio.value = 500;
            
            // Limpiar mapa
            if (typeof window.resetearUI_Global === 'function') {
                window.resetearUI_Global();
            }
        });
    }

    // --- 2. LIMPIEZA DE POLÍGONO (DIBUJO) ---
    const btnLimpiarPoligono = document.getElementById('btnLimpiarPoligono');
    
    if (btnLimpiarPoligono) {
        btnLimpiarPoligono.addEventListener('click', function() {
            // Limpiar mapa (esto borra la capaDibujo)
            if (typeof window.resetearUI_Global === 'function') {
                window.resetearUI_Global();
            }
        });
    }
});