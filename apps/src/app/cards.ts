import { ImplCard, organizeCardMetadata, createGenericAppCard } from "@ci/components";
import { Cards as CardsCrm } from "@ci-apps/crm";
import { Cards as CardsBlog } from "@ci-apps/blog";
import { Cards as CardsTerminal } from "@ci/components/terminal";
import { Cards as CardsAIO } from "@ci/components/aio";
import { Cards as CardsFinanceiro } from "@ci-apps/Financeiro";
import { CI_STATIC_APPS } from "./painel/apps/apps";

const CardModule = [
    CardsCrm,
    CardsBlog,
    CardsTerminal,
    CardsAIO,
    CardsFinanceiro,
];

const extractedCards: ImplCard[] = [
    ...((CardModule) as any)
        .map((cards: any) =>
            [...((Object.keys(cards)
                .filter(k => k.indexOf('CardInfo') > -1) || [])
                .map(k => (cards as any)[k]))]
        )
].reduce((a, b) => [...(a || []), ...(b || [])], []);

// Cards dinâmicos para atalhos operacionais das aplicações da plataforma
const appCards: ImplCard[] = (CI_STATIC_APPS || []).map(app => createGenericAppCard(app));

export const Cards: ImplCard[] = [...extractedCards, ...appCards].map(c => organizeCardMetadata(c));
