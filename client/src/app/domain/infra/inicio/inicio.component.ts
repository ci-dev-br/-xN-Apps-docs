import { Component } from '@angular/core';
import { InfraService } from '../services/infra.service';
import { Domain, DomainService } from '@portal/api';
import { WindowService } from 'src/app/components/window/window.service';
import { DomainComponent } from './casdastros/domain/domain.component';
import { DaoService } from 'src/app/core/dao/dao.service';

@Component({
  selector: 'ci-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent {
  constructor(
    public readonly service: InfraService,
  ) { }
  addDomain() {
  }
}
