"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("./App.css");
const App = ({ title = 'Ibelieve Finance' }) => {
    return (react_1.default.createElement("div", { className: "app-container" },
        react_1.default.createElement("header", { className: "app-header" },
            react_1.default.createElement("h1", null, title),
            react_1.default.createElement("nav", { className: "app-nav" },
                react_1.default.createElement("ul", null,
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("a", { href: "#home" }, "Home")),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("a", { href: "#about" }, "Sobre")),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("a", { href: "#contact" }, "Contato"))))),
        react_1.default.createElement("main", { className: "app-main" },
            react_1.default.createElement("section", { className: "hero-section" },
                react_1.default.createElement("h2", null, "Bem-vindo ao Ibelieve Finance"),
                react_1.default.createElement("p", null, "Uma plataforma inovadora para finan\u00E7as descentralizadas"))),
        react_1.default.createElement("footer", { className: "app-footer" },
            react_1.default.createElement("p", null, "\u00A9 2024 Ibelieve Finance. Todos os direitos reservados."))));
};
exports.default = App;
//# sourceMappingURL=App.js.map