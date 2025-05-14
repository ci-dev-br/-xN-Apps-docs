import { ISchemaPreset } from "@ci/core";
import { UnidadeMedida, UnidadeMedidaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
export const UnidadeMedidaPreset: ISchemaPreset<UnidadeMedidaService, UnidadeMedida> = {
    schemaName: 'UnidadeMedida',
    service: UnidadeMedidaService,
    get: async (s) => await lastValueFrom(
        s.unidadeMedidaGet({ body: { skip: 0, take: 10, where: {} } })
    ),
    sync: async (s, data: UnidadeMedida) => await lastValueFrom(
        s.unidadeMedidaSync({ body: { data: data } })
    )
}