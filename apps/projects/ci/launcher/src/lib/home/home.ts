import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-Home  ',
  imports: [
    CoreModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    //  BoardModule,
    // ThrejsComponent,
  ],
  templateUrl: `home.html`,
  styleUrl: `home.scss`,
})
export class Home implements OnInit {
  locked = true;
  ngOnInit(): void {
  }
}
