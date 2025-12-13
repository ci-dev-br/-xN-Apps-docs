import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  constructor(
    private readonly router: Router,
  ) {
  }
  async CriarNovoProjeto() {
  }
}
