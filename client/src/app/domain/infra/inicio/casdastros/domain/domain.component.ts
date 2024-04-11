import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynFormModule } from 'src/app/components/dyn-form/dyn-form.module';
import { FORM_OPTIONS, IFormOptions } from 'src/app/components/dyn-form/i-form-options';
import { CoreModule } from 'src/app/core/core.module';

@Component({
  selector: 'ci-domain',
  standalone: true,
  imports: [
    CoreModule,
    DynFormModule,
  ],
  providers: [
    {
      provide: FORM_OPTIONS, useValue: [
        {
          title: 'Domínio',
          description: 'Domínio',
          fields: [
            { label: 'Aplicações', type: 'multi-option', property: 'application' },
            { label: 'Hostname', type: 'text', property: 'hostname' },
            { label: 'ID', type: 'text', property: 'id' },
          ]
        }
      ] as IFormOptions[]
    }
  ],
  templateUrl: './domain.component.html',
  styleUrl: './domain.component.scss'
})
export class DomainComponent {

}
