import { Injectable, Optional } from "@angular/core";
import { APPS } from "./apps";
import { ApplicationService } from "@ci/portal-api";

@Injectable()
export class AppsService {
    constructor(
        @Optional() private readonly applications?: ApplicationService,
    ) { }
    private readonly compiled_apps = APPS;
    async getAppList() { }
}