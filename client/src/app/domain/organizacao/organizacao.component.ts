import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Organizacao, OrganizacaoService, Tenant } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { CoreModule } from 'src/app/core/core.module';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from 'src/app/components/message/message.service';
import { MessageModule } from 'src/app/components/message/message.module';

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
    MessageModule,
  ],
  templateUrl: './organizacao.component.html',
  styleUrl: './organizacao.component.scss'
})
export class OrganizacaoComponent {
  @ViewChild('EnviarConvite')
  enviarEmailTemplate?: TemplateRef<any>
  tenants?: Tenant[] = this.userService.user.value?.tenants || undefined;
  current?: Organizacao;
  organizacoesLocalizadas?: Organizacao[];
  cadastroOrganizacaoform = this.fb.group({
    organizatioName: [,],
    cnpjCpf: [,],
  });
  conviteform = this.fb.group({
    email: [,],
    message: [,],
    from: [,],
  });
  constructor(
    private readonly userService: UserService,
    private readonly fb: FormBuilder,
    private readonly api: OrganizacaoService,
    private readonly message: MessageService,
  ) {
    api.organizacaoGetCurrent().subscribe((r: any) => {
      this.tenants = r;
    });
  }
  async procurar() {
    const organizacoes = (await lastValueFrom(this.api.organizacaoFind({ body: { query: this.cadastroOrganizacaoform.get('organizatioName')?.value || '' } })));
    if (organizacoes && organizacoes[0])
      this.organizacoesLocalizadas = organizacoes[0];
  }
  async enviarConvite() {
    let confirmation = await this.message.confirm({
      template: this.enviarEmailTemplate
    })
  }
  async send() {
    
  }
}
