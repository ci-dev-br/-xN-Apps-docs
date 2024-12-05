import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineComponent } from './game-engine.component';



@NgModule({
  declarations: [
    GameEngineComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GameEngineComponent
  ]
})
export class GameEngineModule { }
