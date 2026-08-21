import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
@Injectable()
export class Message {
    constructor(
        private readonly snack: MatSnackBar,
    ) {

    }
    async show(message: string, action?: string, duration?: number) {
        return this.snack.open(message, action, {
            duration: duration || 3000,
        });
    }
}


