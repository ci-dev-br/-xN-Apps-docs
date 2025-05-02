import { Type } from "@angular/core";
import { TotalizadorComponent } from "@ci-apps/crm";
import { ImplCard } from "@ci/components";
import { Card, CardOption } from "@ci/portal-api";

export const Cards: ImplCard[] = [
    {
        title: 'Total de Vendas',
        descricao: `Verifique o total de vendas realizados durante o período selecionado.`,
        tags: ['CRM', 'Totalizador', 'Relatório'],
        componentRef: TotalizadorComponent,
        componentVersion: '1.0.0',
        componentName: 'TotalizadorComponent',
        settings: {

        }
    }
]