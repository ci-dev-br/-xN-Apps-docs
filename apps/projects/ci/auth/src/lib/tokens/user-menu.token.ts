import { InjectionToken } from "@angular/core";
import { IItemMenu } from "@ci/components";

export const USER_MENU = new InjectionToken<IItemMenu[]>('CI::ITEM_MENU');