import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'slide-favorite',
  templateUrl: './slide-favorite.component.html',
  styleUrls: ['./slide-favorite.component.scss'],
  standalone: true,
  imports: [IonicModule]
})

export class SlideFavoriteComponent {
  @Input() side!: string;
  @Input() name!: string;
  @Input() color!: string;
  @Input() message!: string;
}
