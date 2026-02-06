// frontend/js/02_api.js

// 🔴 IMPORTANTE: Para desarrollo local usamos el puerto 8000
window.API_URL = 'https://sigetux.tuxtla.gob.mx/api';

// Función para obtener la lista de zonas
async function getListaZonas() {
    const response = await fetch(`${window.API_URL}/lista-centralidades/`);
    return await response.json();
}

// Función para obtener la geometría de una zona
async function getPoligonoZona(clave) {
    const claveCodificada = encodeURIComponent(clave);
    const response = await fetch(`${window.API_URL}/centralidades/?clave_2=${claveCodificada}`);
    return await response.json();
}

// Función para obtener datos censales (usando BBOX)
async function getDatosCenso(bbox) {
    const response = await fetch(`${window.API_URL}/censo/?in_bbox=${bbox}`);
    return await response.json();
}

// Función para obtener negocios
async function getNegocios(claveZona) {
    const claveCodificada = encodeURIComponent(claveZona);
    const response = await fetch(`${window.API_URL}/denue/?clave_2=${claveCodificada}`);
    return await response.json();
}