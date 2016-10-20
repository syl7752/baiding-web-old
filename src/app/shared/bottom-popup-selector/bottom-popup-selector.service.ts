import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {BottomPopupSelectorModel, BottomPopupSelectorItemModel}    from './bottom-popup-selector.model';

@Injectable()
export class BottomPopupSelectorService {
  // Observable string sources
  private popupSource = new Subject<BottomPopupSelectorModel>();
  private closeSource = new Subject<string>();
  private itemSelectedSource = new Subject<BottomPopupSelectorItemModel>();
  // Observable string streams
  needPopup$ = this.popupSource.asObservable();
  itemSelected$ = this.itemSelectedSource.asObservable();
  needClose$ = this.closeSource.asObservable();
  isClosed = true;
  // Service message commands
  popup(model: BottomPopupSelectorModel) {
    this.popupSource.next(model);
    this.isClosed = false;
  }

  close() {
    this.closeSource.next('');
    this.isClosed = true;
  }

  selectItem(item: BottomPopupSelectorItemModel) {
    this.itemSelectedSource.next(item);
  }
}
