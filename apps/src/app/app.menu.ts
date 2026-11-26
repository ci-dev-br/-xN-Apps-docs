import { isDevMode } from "@angular/core";
import { ProfileMenu } from "@ci/auth";
import { IItemMenu } from "@ci/components/window";

export const MyEndMenu: IItemMenu[] = [
    isDevMode() ? {
        label: '',
        
    } : {
        label: 'Versão X'
    },
    {
        label: 'Definições do Usuário',
        icon: '',
        component: ProfileMenu,
    }
];