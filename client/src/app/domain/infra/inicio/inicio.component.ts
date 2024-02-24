import { Component } from '@angular/core';
import { InfraService } from '../services/infra.service';

@Component({
  selector: 'ci-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent {
  constructor(
    public readonly service: InfraService,
  ) { }

}
