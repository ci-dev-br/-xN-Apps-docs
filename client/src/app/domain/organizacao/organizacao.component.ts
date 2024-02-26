import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Organizacao, OrganizacaoService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { CoreModule } from 'src/app/core/core.module';

@Component({
  selector: 'ci-organizacao',
  standalone: true,
  imports: [
    CoreModule,
    ReactiveFormsModule,
    LNavModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './organizacao.component.html',
  styleUrl: './organizacao.component.scss'
})
export class OrganizacaoComponent {
  current?: Organizacao;
  organizacoesLocalizadas?: Organizacao[];
  cadastroOrganizacaoform = this.fb.group({
    organizatioName: [,],
    cnpjCpf: [,],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly api: OrganizacaoService,
  ) {
    api.organizacaoGetCurrent().subscribe((r: any) => {
      if (!!r) this.current = r as Organizacao;
    });
  }
  async procurar() {
    const organizacoes = (await lastValueFrom(this.api.organizacaoFind({ body: { query: this.cadastroOrganizacaoform.get('organizatioName')?.value || '' } })));

    if (organizacoes && organizacoes[0])
      this.organizacoesLocalizadas = organizacoes[0];
  }
}
