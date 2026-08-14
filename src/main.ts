import "./styles.css";
// Identidad fijada en M5: Aula-laboratorio escénica. Véase `docs/direcciones_m5.md`.
import "./styles/identity.css";
import { mountApp } from "./app/render-app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("No se encontró el contenedor principal");

mountApp(root);
