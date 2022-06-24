import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UserDetailsModel } from 'src/app/infrastructure/models/user-details.model';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { UserServiceService } from 'src/app/infrastructure/services/user-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public usersList: UserDetailsModel[] = [];

  constructor(
    private loaderService: LoaderService,
    private userService: UserServiceService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.fetchUsers();
  }

  private fetchUsers = (): void => {
    this.loaderService.show();
    this.userService
      .getAllUsers()
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.usersList = result;
        },
        (error) => {}
      );
  };
}
