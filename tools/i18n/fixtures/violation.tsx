// Synthetic positive case for the i18n audit script.
// This file intentionally contains hard-coded user-facing Spanish literals
// so AuditScriptTest can assert the auditor flags them. It is excluded from
// production builds and from the audit's default include set; the test
// invokes the audit explicitly against this path.

import { type ReactElement } from 'react'

export function Violation(): ReactElement {
    return (
        <section aria-label="Sección de violación">
            <h1>Iniciar proyecto</h1>
            <button title="Cerrar formulario">Cancelar</button>
        </section>
    )
}
