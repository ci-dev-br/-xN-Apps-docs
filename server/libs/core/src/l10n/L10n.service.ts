import { Injectable, Scope } from "@nestjs/common";
@Injectable({
    scope: Scope.REQUEST,
})
export class L10nService {
    constructor(
    ) { }
    async update() { }
}