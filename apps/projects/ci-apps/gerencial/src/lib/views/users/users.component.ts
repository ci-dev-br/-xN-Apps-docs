import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CoreModule } from "@ci/core";
import { GridBuilder, GridModule, IDataGridOptions } from "@ci/components";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { User, UserService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { ContainerModule } from "@ci/components";
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
    ]
}) export class UsersComponent implements OnInit {
    stage?: 'loading' | 'ready' | 'damned' = 'loading';
    // visualizacao: 'table' | 'list' = 'table';
    // filtrarPapel?: string = 'all';
    gridOptions?: IDataGridOptions<User>;
    users?: User[];
    constructor(
        /// private readonly applications: ApplicationService,
        /// private readonly janela: WindowService,
        private readonly userService: UserService,
        private readonly gb: GridBuilder,
    ) {
        (async () => this.find())();
    }
    async ngOnInit() {
        this.gridOptions = await this.gb.FromSchema('User');
        this.stage = 'ready';
    }
    async adicionar() {

    }
    async find() {
        try {
            this.users = await lastValueFrom(this.userService.getList());
            this.stage = 'ready';
        } catch (error) {
            this.stage = 'damned';
        }
    }
    async cadastrarNovoUsuario() {

    }
    async localizarUsuario() {

    }
}