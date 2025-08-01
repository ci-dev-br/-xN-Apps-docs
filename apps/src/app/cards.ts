import { ImplCard } from "@ci/components";
// import { ReceitaAnualCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/receita-anual.component";
// import { ListCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/list.component";
// import { CustomerByContryCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/customer-by-country.component";
// import { StatisticsCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/statistics.component";
// import { CalendarCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/calendar.component";
// import { AvailableForInstantPayoutCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/available-for-instant-payout.component";
import { Cards as CardsCrm } from "../../projects/ci-apps/crm/src/public-api";

export const Cards: ImplCard[] = [
    ...Object.keys(CardsCrm).filter(k => k.indexOf('CardInfo') > -1).map(k => (CardsCrm as any)[k])
]
/// CardsCrm.AvailableForInstantPayoutCardInfo,
/// CardsCrm.ListCardInfo,
/// CardsCrm.CalendarCardInfo,
/// CardsCrm.StatisticsCardInfo,
/// CardsCrm.TotalizadorCardInfo,
/// CardsCrm.ReceitaAnualCardInfo,
/// CardsCrm.CustomerByContryCardInfo,
// ReceitaAnualCardInfo,
// ListCardInfo,
// CustomerByContryCardInfo,
// StatisticsCardInfo,
// CalendarCardInfo,
// AvailableForInstantPayoutCardInfo,