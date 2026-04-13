// src/services/compiler.ts
/**
 * Sends the current code to the backend compiler API and expects a parsing result.
 */
export async function compileCodeAPI(code) {
    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const result = await response.json();
        return result;
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Failed: ${err.message}`);
        }
        throw new Error('An unknown error occurred during compilation.');
    }
}
//# sourceMappingURL=compiler.js.map