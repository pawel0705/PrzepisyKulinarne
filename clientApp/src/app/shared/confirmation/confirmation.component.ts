import { Component, OnInit } from '@angular/core';
import {ConfirmationService} from 'src/app/infrastructure/services/confirmation.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  constructor(public confirmationService: ConfirmationService) { }

  ngOnInit(): void {
  }

}
