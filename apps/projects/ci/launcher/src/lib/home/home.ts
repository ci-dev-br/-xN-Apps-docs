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
  g = [
    'https://images.pexels.com/photos/33258471/pexels-photo-33258471.jpeg',
    'https://images.pexels.com/photos/33869022/pexels-photo-33869022.jpeg',
    'https://images.pexels.com/photos/34234277/pexels-photo-34234277.png',
    'https://images.pexels.com/photos/6009490/pexels-photo-6009490.jpeg',
    'https://images.pexels.com/photos/11394988/pexels-photo-11394988.jpeg',
    'https://images.pexels.com/photos/34442367/pexels-photo-34442367.jpeg',
  ];
  x?: string;
  agora = new Date();
  y?: string;
  ngOnInit(): void {
    this.updateTime();
  }
  async updateTime() {
    this.agora = new Date();
    setTimeout(() => this.updateTime(), 500);
  }
  async load() {
    let a = this.g[Math.round(Math.random() * (this.g.length - 1))];
    if ((await fetch('' + a)).status === 200) {
      this.x = a;
      a = this.g[Math.round(Math.random() * (this.g.length - 1))];
    } else {
      this.load();
    }
  }
}
