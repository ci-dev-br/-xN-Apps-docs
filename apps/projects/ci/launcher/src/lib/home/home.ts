import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';

@Component({
  selector: 'ci-Home  ',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    BoardModule,
  ],
  templateUrl: `home.html`,
  styleUrl: `home.scss`,
})
export class Home implements OnInit {
  agora = new Date();

  ngOnInit(): void {
    if (!!window) {
      setInterval(() => this.agora = new Date(), 1000)
    }
  }

}
