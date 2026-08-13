import "./styles.css";
import { mountApp } from "./app/render-app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("No se encontró el contenedor principal");

mountApp(root);
