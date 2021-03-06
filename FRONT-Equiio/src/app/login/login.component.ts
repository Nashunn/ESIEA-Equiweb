import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import {Response} from '../models/response.model';
import {AlertService} from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import {Roles} from "../models/roles.model";

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
  public errorLog = '';
  public errorReg = '';
  public failedAuthCount = 0;

  // Constructor
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentSessionValue) {
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

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.authenticationService.login(this.flog.login_email.value, this.flog.login_password.value)
      .pipe(first())
      .subscribe((response: Response|any) => {
        if (response.returnCode > 200) {
          if (this.failedAuthCount < 2) {
            this.alertService.error(response.message);
            this.failedAuthCount++;
          } else {
            this.failedAuthCount = 0;
            this.router.navigate(['/auth/reset']);
          }
        } else {
          if (this.authenticationService.currentSessionValue.getUserRole() === Roles.Admin) {
            this.router.navigate(['/users']);
          } else {
            // get return url from route parameters or default to '/'
            const returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
            this.router.navigate([returnUrl]);
          }
        }
      });
  }

  // Submit Register form
  public onSubmitReg(): void {
    this.registerSubmitted = true;

    // stop here if phone length !== 10
    if (this.registerForm.get('reg_tel').value.length !== 10) {
      this.errorReg = 'Le téléphone doit être composé de 10 chiffres';
      return;
    }

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    // stop here if pwd and pwdConfirm are not the same
    if (this.registerForm.get('reg_passwordConfirm').value !== this.registerForm.get('reg_password').value) {
      this.errorReg = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.authenticationService.register(
      this.registerForm.get('reg_firstname').value,
      this.registerForm.get('reg_lastname').value,
      this.registerForm.get('reg_email').value,
      this.registerForm.get('reg_tel').value,
      this.registerForm.get('reg_licence').value,
      this.registerForm.get('reg_password').value,
      )
      .pipe(first())
      .subscribe((response: Response|any) => {
        if (response.returnCode > 200) {
          this.alertService.error(response.message);
          // this.errorLog = response.message;
        } else {
          // get return url from route parameters or default to '/'
          const returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
          this.router.navigate([returnUrl]);
        }
      });
  }
}
