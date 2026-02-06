// frontend/js/12_graficas.js

let chartDemografico = null;
let chartEconomico = null;

// Colores del sistema (Vino, Dorado, Azul, Gris)
const COLORES = {
    vino: '#7f2b47',
    dorado: '#d4a037',
    azul: '#0d6efd',
    gris: '#6c757d',
    fondo: '#f8f9fa'
};

/**
 * Función Maestra para actualizar todas las gráficas
 * @param {number} hombres - Cantidad de hombres
 * @param {number} mujeres - Cantidad de mujeres
 * @param {Array} featuresNegocios - Array de geojson features de los negocios
 */
window.actualizarGraficas = function(hombres, mujeres, featuresNegocios) {
    renderizarGraficaDemografica(hombres, mujeres);
    renderizarGraficaEconomica(featuresNegocios);
};

// 1. Gráfica de Dona (Demografía)
function renderizarGraficaDemografica(hombres, mujeres) {
    const ctx = document.getElementById('graficaDemografica').getContext('2d');
    
    // Si ya existe, la destruimos para crear una nueva (animación fresca)
    if (chartDemografico) chartDemografico.destroy();

    const total = hombres + mujeres;
    // Evitar gráfica vacía
    if (total === 0) return;

    chartDemografico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Mujeres', 'Hombres'],
            datasets: [{
                data: [mujeres, hombres],
                backgroundColor: [
                    '#c06c84', // Tono rosado/vino para mujeres
                    '#355c7d'  // Tono azul oscuro para hombres
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 10 } } },
                title: { 
                    display: true, 
                    text: 'Distribución por Sexo',
                    color: COLORES.gris,
                    font: { size: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let val = context.raw;
                            let percentage = ((val / total) * 100).toFixed(1) + '%';
                            return ` ${val.toLocaleString()} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

// 2. Gráfica de Barras (Economía)
function renderizarGraficaEconomica(negocios) {
    const ctx = document.getElementById('graficaEconomica').getContext('2d');
    
    if (chartEconomico) chartEconomico.destroy();

    if (!negocios || negocios.length === 0) return;

    // Contar categorías
    let comercio = 0, servicios = 0, industria = 0;
    
    negocios.forEach(f => {
        const cat = window.getCategoria(f.properties.codigo_act);
        if (cat === 'comercio') comercio++;
        else if (cat === 'servicios') servicios++;
        else if (cat === 'industria') industria++;
    });

    chartEconomico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Comercio', 'Servicios', 'Industria'],
            datasets: [{
                label: 'Unidades',
                data: [comercio, servicios, industria],
                backgroundColor: [
                    '#dc3545', // Rojo Comercio
                    '#0d6efd', // Azul Servicios
                    '#ffc107'  // Amarillo Industria
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // 'y' para barras horizontales, 'x' para verticales
            scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: 'Vocación Económica',
                    color: COLORES.gris,
                    font: { size: 12 }
                }
            }
        }
    });
}