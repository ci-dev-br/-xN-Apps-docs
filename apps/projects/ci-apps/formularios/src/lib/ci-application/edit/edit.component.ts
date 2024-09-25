import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Form, FormsService } from '@ci/portal-api';

@Component({
  selector: 'ci-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  form?: Form;
  constructor(
    private readonly formsService: FormsService,
    private readonly route: ActivatedRoute,
  ) { }
  async ngOnInit() {
    this.formsService.formsGetByInternalId({ body: { internalId: this.route.snapshot.paramMap.get('FormId') } }).subscribe(form_data => {
      this.form = form_data
    });
  }
}
