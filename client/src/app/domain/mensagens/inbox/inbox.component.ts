import { Component } from '@angular/core';
import { DataGroupModule } from 'src/app/components/data-group/data-group.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';

@Component({
  selector: 'ci-inbox',
  standalone: true,
  imports: [
    DataGroupModule,
    LNavModule,
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  
}
