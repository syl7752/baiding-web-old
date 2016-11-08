import {Component, OnInit, DoCheck} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import * as moment from "moment";

import {LiveInfoModel} from "../../../shared/api/live/live.model";
import {sizeValidator, typeValidator} from "../../../shared/file-selector/file-selector.validator";
import {LiveService} from "../../../shared/api/live/live.service";
import {futureValidator} from "../../../shared/form/future.validator";
import {UploadApiService} from "../../../shared/api/upload/upload.api";

@Component({
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.scss'],
})

export class EditInfoComponent implements OnInit, DoCheck {
  liveId: string;
  liveInfo: LiveInfoModel;
  form: FormGroup;
  coverFiles: File[];
  coverSrc: SafeUrl;
  originCoverSrc: SafeUrl;
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

  constructor(private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer,
              private fb: FormBuilder, private liveService: LiveService, private uploadService: UploadApiService) {
  }

  ngOnInit() {
    this.liveId = this.route.parent.parent.snapshot.params['id'];
    this.liveInfo = this.route.snapshot.data['liveInfo'];

    if (!this.liveService.isAdmin(this.liveId)) this.backToViewInfo();

    let expectStartAt = moment(this.liveInfo.expectStartAt);
    if (expectStartAt.isValid() && expectStartAt.unix() > 0) this.time = expectStartAt.format('YYYY-MM-DDTHH:mm');

    if (this.liveInfo.coverUrl) this.originCoverSrc = this.sanitizer.bypassSecurityTrustUrl(`${this.liveInfo.coverUrl}?${this.liveInfo.updatedAt}`);

    this.title = this.liveInfo.subject;
    this.desc = this.liveInfo.desc;

    this.form = this.fb.group({
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

    if (this.liveInfo.isCreated()) {
      this.form.addControl('time', new FormControl(this.time, [
        Validators.required,
        Validators.pattern('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}'),
        futureValidator(),
      ]));
    }

    this.defaultCoverSrc = this.sanitizer.bypassSecurityTrustUrl('/assets/img/liveroombanner-blur.jpg');
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
        this.coverSrc = this.originCoverSrc || this.defaultCoverSrc;
      }
    } else {
      this.coverSrc = this.originCoverSrc || this.defaultCoverSrc;
    }
  }

  backToViewInfo() {
    this.router.navigate([`/lives/${this.liveId}/settings/view-info`]);
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
    if (this.coverFiles && this.coverFiles.length) {
      this.liveService.getCoverUploadToken(this.liveId).then((data) => {
        let uploadOption = {
          key: data.coverKey,
          token: data.token,
        };

        return this.uploadService.uploadToQiniu(this.coverFiles[0], uploadOption);
      }).then((imageKey) => {
        this.updateLiveInfo(imageKey);
      });
    } else {
      this.updateLiveInfo();
    }
  }

  updateLiveInfo(coverKey?: string) {
    let expectStartAt = moment(`${this.time}:00`).local();

    this.liveService.updateLiveInfo(this.liveId, this.title, this.desc, expectStartAt.toISOString(), coverKey).then(() => {
      return this.liveService.getLiveInfo(this.liveId, true);
    }).then(() => {
      this.submitted = true;
      this.router.navigate([`/lives/${this.liveId}/settings/view-info`]);
    });
  }

  canDeactivate() {
    return !this.form.dirty || this.submitted;
  }
}
