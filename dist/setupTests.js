"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
// Mock global do fetch
global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
}));
// Limpa todos os mocks após cada teste
beforeEach(() => {
    jest.clearAllMocks();
});
//# sourceMappingURL=setupTests.js.map