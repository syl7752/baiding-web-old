import {Component, OnInit, DoCheck} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {LiveService} from "../../shared/api/live/live.service";
import {UploadApiService} from "../../shared/api/upload/upload.api";
import {sizeValidator, typeValidator} from "../../shared/file-selector/file-selector.validator";
import {futureValidator} from "../../shared/form/future.validator";

@Component({
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})

export class CreateComponent implements OnInit, DoCheck {
  form: FormGroup;
  coverFiles: File[];
  coverSrc: SafeUrl;
  defaultCoverSrc: SafeUrl;
  fileTypeRegexp = /^image\/gif|jpg|jpeg|png|bmp|raw$/;
  maxSizeMB = 8;
  maxTitleLength = 20;
  maxDescLength = 600;
  time = '';
  title = '';
  desc = '';
  oldFileName = '';
  submitted = false;
  isSubmitting = false;

  constructor(private router: Router, private sanitizer: DomSanitizer,
              private fb: FormBuilder, private liveService: LiveService, private uploadService: UploadApiService) {
  }

  ngOnInit() {
    this.defaultCoverSrc = this.sanitizer.bypassSecurityTrustUrl('/assets/img/liveroombanner-blur.jpg');

    this.time = moment().add(moment.duration(1, 'h')).format('YYYY-MM-DDTHH:mm');

    this.form = this.fb.group({
      'time': new FormControl(this.time, [
        Validators.required,
        Validators.pattern('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}'),
        futureValidator(),
      ]),
      'cover': new FormControl(this.coverFiles, [
        sizeValidator(this.maxSizeMB),
        typeValidator(this.fileTypeRegexp),
      ]),
      'title': new FormControl(this.title, [
        Validators.required,
        Validators.maxLength(this.maxTitleLength)
      ]),
      'desc': new FormControl(this.desc, [
        Validators.required,
        Validators.maxLength(this.maxDescLength)
      ]),
    });

  }

  ngDoCheck() {
    if (this.form.controls['cover'].valid && this.coverFiles) {
      if (this.coverFiles.length) {
        let file = this.coverFiles[0];

        if (this.oldFileName === file.name) return;

        let reader = new FileReader();

        reader.onload = (e) => {
          this.coverSrc = this.sanitizer.bypassSecurityTrustUrl(e.target['result']);
          this.oldFileName = file.name;
        };

        reader.readAsDataURL(file);
      } else {
        this.coverSrc = this.defaultCoverSrc;
      }
    } else {
      this.coverSrc = this.defaultCoverSrc;
    }
  }

  submit() {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });

    if (this.form.invalid) return;

    this.postLiveInfo();
  }

  postLiveInfo() {
    let expectStartAt = moment(`${this.time}:00`).local();

    this.isSubmitting = true;

    this.liveService.createLive(this.title, '', this.desc, expectStartAt.toISOString()).then(liveId => {
      if (this.coverFiles && this.coverFiles.length) {
        return this.liveService.getCoverUploadToken(liveId).then((data) => {
          let uploadOption = {
            key: data.coverKey,
            token: data.token,
          };

          return this.uploadService.uploadToQiniu(this.coverFiles[0], uploadOption);
        }).then((imageKey) => {
          return this.updateLiveInfo(liveId, imageKey);
        });
      }else {
        return Promise.resolve(liveId);
      }
    }).then((liveId) => {
      this.submitted = true;
      this.gotoLive(liveId);
    }).finally(() => {
      this.isSubmitting = false;
    });
  }

  gotoLive(liveId: string) {
    this.router.navigate([`/lives/${liveId}`]);
  }

  gotoInfoCenter() {
    this.router.navigate([`/info-center`]);
  }

  updateLiveInfo(liveId: string, coverKey?: string): Promise<string> {
    let expectStartAt = moment(`${this.time}:00`).local();

    return this.liveService.updateLiveInfo(liveId, this.title, this.desc, expectStartAt.toISOString(), coverKey).then(() => {
      return this.liveService.getLiveInfo(liveId, true);
    }).then(() => {
      return liveId;
    });
  }

  canDeactivate() {
    return !this.form.dirty || this.submitted;
  }
}