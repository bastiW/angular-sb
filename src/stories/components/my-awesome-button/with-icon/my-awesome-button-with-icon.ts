import { Component, ChangeDetectionStrategy } from '@angular/core';
import {ButtonComponent} from '../../../../app/button';

@Component({
  selector: 'app-my-awesome-button-with-icon',
  templateUrl: './my-awesome-button-with-icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class MyAwesomeButtonWithIconStoryComponent {
}
