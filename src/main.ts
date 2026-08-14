import "./styles.css";
// Capa de dirección M5. Eliminar esta línea devuelve el corte al gris de M4.
import "./styles/directions.css";
import { mountApp } from "./app/render-app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("No se encontró el contenedor principal");

mountApp(root);
