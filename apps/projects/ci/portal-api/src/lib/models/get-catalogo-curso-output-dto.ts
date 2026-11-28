/* tslint:disable */
/* eslint-disable */
import { Curso } from '../models/curso';
import { Matricula } from '../models/matricula';
export interface GetCatalogoCursoOutputDto {
  cursos: Array<Curso>;
  matriculas: Array<Matricula>;
}
