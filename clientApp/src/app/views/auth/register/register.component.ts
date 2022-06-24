import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(private metaService: Meta) {}

  ngOnInit(): void {
    this.setMetaDescripition(this.header);
  }
  header: string = 'Załóż swoje konto';

  private setMetaDescripition(text: string) {
    if (text)
      this.metaService.updateTag({ name: 'description', content: text });
  }
}
