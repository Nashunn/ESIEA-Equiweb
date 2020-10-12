import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', './../app.component.scss'],
})

export class EquiioLoginComponent implements OnInit {
  public loginForm: FormGroup;
  public registerForm: FormGroup;
  public loginSubmitted = false;
  public registerSubmitted = false;
  public error = '';

  // Constructor
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login_email: ['', Validators.required],
      login_password: ['', Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      reg_firstname: ['', Validators.required],
      reg_lastname: ['', Validators.required],
      reg_email: ['', Validators.required],
      reg_tel: ['', Validators.required],
      reg_licence: [''],
      reg_password: ['', Validators.required],
      reg_passwordConfirm: ['', Validators.required],
    });
  }

  // Getter for easy access to form fields
  get flog(): { [p: string]: AbstractControl } { return this.loginForm.controls; }
  get freg(): { [p: string]: AbstractControl } { return this.registerForm.controls; }

  // Submit Login form
  public onSubmitLog(): void {
    this.loginSubmitted = true;
    console.log('Login submit');

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.authenticationService.login(this.flog.login_email.value, this.flog.login_password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from route parameters or default to '/'
          const returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.error = error;
        },
      });
  }

  // Submit Register form
  public onSubmitReg(): void {
    this.registerSubmitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.authenticationService.register(
      this.freg.register_firstname.value,
      this.freg.register_lastname.value,
      this.freg.register_email.value,
      this.freg.register_tel.value,
      this.freg.register_licence.value,
      this.freg.register_password.value,
      this.freg.register_passwordConfirm.value,
      )
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from route parameters or default to '/'
          const returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.error = error;
        },
      });
  }
}
