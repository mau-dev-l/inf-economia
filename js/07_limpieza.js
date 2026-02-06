// core/static/core/js/07_limpieza.js

document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btnLimpiarCentralidad');
    const combo = document.getElementById('cmbCentralidad');

    // Solo ejecutamos si existen los elementos en el HTML
    if (btnLimpiar && combo) {
        btnLimpiar.addEventListener('click', function() {
            console.log("Limpiando selección de zona...");

            // 1. Reiniciar el select a la opción vacía (default)
            combo.value = "";
            
            // 2. Limpiar todo el mapa y datos
            // Usamos la función global maestra que definimos en 01_mapa_base.js
            if (typeof window.resetearUI_Global === 'function') {
                window.resetearUI_Global();
            } else {
                console.warn("La función resetearUI_Global no está disponible.");
            }
        });
    }
});