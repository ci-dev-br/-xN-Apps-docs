import { Component } from '@angular/core';
import { DataGroupModule } from 'src/app/components/data-group/data-group.module';

@Component({
  selector: 'ci-inbox',
  standalone: true,
  imports: [
    DataGroupModule,
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  
}
