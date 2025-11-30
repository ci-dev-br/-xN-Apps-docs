import { ImplCard } from "@ci/components";
import { Cards as CardsCrm } from "@ci-apps/crm";
import { Cards as CardsBlog } from "@ci-apps/blog";
const CardModule = [
    CardsCrm,
    CardsBlog,
];
export const Cards: ImplCard[] = [
    ...((CardModule) as any)
        .map((cards: any) =>
            [...((Object.keys(cards)
                .filter(k => k.indexOf('CardInfo') > -1) || [])
                .map(k => (cards as any)[k]))]
        )
].reduce((a, b) => [...a || [a], ...b || [b]]);