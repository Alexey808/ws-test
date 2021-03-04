import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BnComponent } from './bn.component';

@NgModule({
  declarations: [ BnComponent ],
  exports: [
    BnComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class BnModule {}
