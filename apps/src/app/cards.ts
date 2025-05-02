import { TotalizadorCardInfo } from "@ci-apps/crm";
import { ImplCard } from "@ci/components";
import { ReceitaAnualCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/receita-anual.component";
import { ListCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/list.component";
import { CustomerByContryCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/customer-by-country.component";
import { StatisticsCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/statistics.component";
import { CalendarCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/calendar.component";
import { AvailableForInstantPayoutCardInfo } from "../../projects/ci-apps/crm/src/lib/cards/available-for-instant-payout.component";

export const Cards: ImplCard[] = [
    TotalizadorCardInfo,
    ReceitaAnualCardInfo,
    ListCardInfo,
    CustomerByContryCardInfo,
    StatisticsCardInfo,
    CalendarCardInfo,
    AvailableForInstantPayoutCardInfo,
]