import { ImplCard } from "@ci/components";
import { Cards as CardsCrm } from "@ci-apps/crm";
import { Cards as CardsBlog } from "@ci-apps/blog";
import { Cards as CardsTerminal } from "@ci/components/terminal";
const CardModule = [
    CardsCrm,
    CardsBlog,
    CardsTerminal,
];
export const Cards: ImplCard[] = [
    ...((CardModule) as any)
        .map((cards: any) =>
            [...((Object.keys(cards)
                .filter(k => k.indexOf('CardInfo') > -1) || [])
                .map(k => (cards as any)[k]))]
        )
].reduce((a, b) => [...a || [a], ...b || [b]]);
console.log(Cards);