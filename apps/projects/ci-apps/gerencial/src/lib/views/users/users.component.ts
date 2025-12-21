import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CoreModule } from "@ci/core";
import { GridBuilder, GridModule, IDataGridOptions, WindowModule, WindowService } from "@ci/components";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { User, UserService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { ContainerModule } from "@ci/components";
import { EditarComponent } from "./editar/editar.component";
@Component({
    selector: 'ci-users-view',
    standalone: true,
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [
        CoreModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatTableModule,
        GridModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        FormsModule,
        ContainerModule,
        WindowModule,
    ]
}) export class UsersComponent implements OnInit {
    stage?: 'loading' | 'ready' | 'damned' = 'loading';
    // visualizacao: 'table' | 'list' = 'table';
    filtrarPapel?: string;
    papeis: string[] = ['ADMIN', 'GOODNESS', 'USER'];
    gridOptions?: IDataGridOptions<User>;
    users?: User[];
    constructor(
        private readonly userService: UserService,
        private readonly gb: GridBuilder,
        private readonly window: WindowService,
    ) {
        (async () => this.find())();
    }
    async ngOnInit() {
        this.gridOptions = await this.gb.FromSchema('User');
        this.stage = 'ready';
    }
    async find() {
        try {
            this.users = await lastValueFrom(this.userService.getList());
            this.stage = 'ready';
        } catch (error) {
            this.stage = 'damned';
        }
    }
    async editar(data: User, event?: Event) {
        return await this.window.open(EditarComponent,
            { schemaName: 'User', data }, 'User');
    }
    async createNew() {
        let new_instance: User = {} as User;
        const data = await this.editar(new_instance);
        if (!!data?.internalId || !!data?.id) // TODO: revisar esta regra
            this.users = [data, ...this.users || []];
    }
    /**
     * Enviar convite para novo usuário
     */
    async enviarConvite() {
        // Abrir dialog para obter email ou número sms para envio de convite
        
    }
}