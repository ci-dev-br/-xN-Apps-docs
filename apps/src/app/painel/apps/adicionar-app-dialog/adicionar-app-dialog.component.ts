import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ApplicationCatalogService } from '@ci/core';
import { UserAuthenticationService } from '@ci/auth';

@Component({
    selector: 'ci-adicionar-app-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule
    ],
    templateUrl: './adicionar-app-dialog.component.html',
    styleUrls: ['./adicionar-app-dialog.component.scss']
})
export class AdicionarAppDialogComponent implements OnInit {
    gitForm: FormGroup;
    selectedMode: 'choice' | 'git-form' = 'choice';
    isSubmitting = false;
    isDeveloper = false;

    constructor(
        public dialogRef: MatDialogRef<AdicionarAppDialogComponent>,
        private readonly fb: FormBuilder,
        private readonly catalogService: ApplicationCatalogService,
        @Optional() private readonly userService?: UserAuthenticationService,
        @Optional() private readonly snackBar?: MatSnackBar,
        @Optional() private readonly router?: Router
    ) {
        this.gitForm = this.fb.group({
            gitUrl: ['', [Validators.required, Validators.pattern(/^(http|https|git@).+/)]],
            moduleName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_]+$/)]],
            appKey: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
            name: [''],
            branch: ['main'],
            configurations: ['{\n  "enabled": true\n}']
        });
    }

    ngOnInit(): void {
        const user = this.userService?.user?.value;
        this.isDeveloper = Boolean(
            user?.roles?.includes('DEVELOPER') ||
            user?.roles?.includes('MASTER') ||
            user?.roles?.includes('GOODNESS')
        );
    }

    goToStore(): void {
        this.dialogRef.close({ action: 'store' });
        this.router?.navigate(['/painel/Loja']);
    }

    openGitForm(): void {
        if (!this.isDeveloper) {
            this.snackBar?.open('Esta opção exige ROLE DEVELOPER para adicionar módulos customizados.', 'Fechar', { duration: 3500 });
            return;
        }
        this.selectedMode = 'git-form';
    }

    backToChoice(): void {
        this.selectedMode = 'choice';
    }

    onAppKeyInput(): void {
        const appKeyVal = this.gitForm.get('appKey')?.value;
        if (appKeyVal && !this.gitForm.get('name')?.value) {
            this.gitForm.patchValue({ name: appKeyVal });
        }
    }

    submitGitModule(): void {
        if (this.gitForm.invalid || this.isSubmitting) {
            return;
        }

        let parsedConfigs: Record<string, any> = {};
        const configText = this.gitForm.get('configurations')?.value;
        if (configText && configText.trim()) {
            try {
                parsedConfigs = JSON.parse(configText);
            } catch (e) {
                this.snackBar?.open('O campo de configurações deve ser um JSON válido.', 'Fechar', { duration: 4000 });
                return;
            }
        }

        this.isSubmitting = true;
        const formValues = this.gitForm.value;

        this.catalogService.installGitModule({
            gitUrl: formValues.gitUrl.trim(),
            moduleName: formValues.moduleName.trim(),
            appKey: formValues.appKey.trim(),
            name: (formValues.name || formValues.appKey).trim(),
            branch: (formValues.branch || 'main').trim(),
            configurations: parsedConfigs
        }).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.snackBar?.open(
                    `Módulo "${formValues.moduleName}" clonado em pasta isolada! Compilação paralela iniciada.`,
                    'OK',
                    { duration: 4500 }
                );
                // Atualiza lista de aplicações ativadas para refletir em 'meus-apps'
                this.catalogService.refreshMyActivations().subscribe();
                this.dialogRef.close({ action: 'git_installed', app: res });
            },
            error: (err) => {
                this.isSubmitting = false;
                const errorMsg = err?.error?.message || 'Falha ao clonar repositório Git ou registrar módulo.';
                this.snackBar?.open(errorMsg, 'Fechar', { duration: 5000 });
            }
        });
    }
}
