import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  isVisible: boolean = false;
  isHidden: boolean = false;

  constructor(private zone: NgZone) { }

  show = () => {
    this.zone.run(() => {
      this.isHidden = false;
      this.isVisible = true;
    });
  };

  hide = () => {
    this.zone.run(() => {
      this.isHidden = true;
      setTimeout(() => {
        this.isVisible = false;
      }, 500);
    })
  }
}
