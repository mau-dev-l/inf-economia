// frontend/js/15_referencia.js

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🏗️ Cargando Capa de Referencia (Centralidades)...");

    try {
        // Usamos la URL base global o la local por defecto
        const baseURL = window.API_URL || 'http://127.0.0.1:8000';
        const url = `${baseURL}/capa-referencia-centralidades/`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en red al cargar referencia");

        const data = await response.json();

        // 1. Creamos la capa y la guardamos en una constante 'capaRef'
        const capaRef = L.geoJSON(data, {
            style: {
                color: '#9e9e9e',       // Gris un poco más claro
                weight: 2,              // Un poco más grueso para que se note el borde
                opacity: 0.7,           
                fillColor: 'transparent',
                fillOpacity: 0,
                dashArray: '5, 5'       // Línea punteada
            },
            interactive: false          // Ignorar clics
        }).addTo(map);

        // 2. 🔍 EL TRUCO: Hacemos Zoom automático a esta capa
        // Verificamos que traiga datos para no romper el mapa
        if (data.features && data.features.length > 0) {
            map.fitBounds(capaRef.getBounds(), {
                padding: [50, 50], // Dejamos un margencito de 50px para que no quede pegado al borde
                animate: true
            });
            console.log("✅ Zoom ajustado a las Centralidades.");
        }

    } catch (error) {
        console.error("❌ No se pudo cargar la capa de referencia:", error);
    }
});