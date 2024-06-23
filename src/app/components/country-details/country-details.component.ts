import { Component, Input } from '@angular/core';
import { Country } from 'src/app/models/country.model';
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';

@Component({
  selector: 'country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
  standalone: true,
  imports: [IonicModule, NgIf]
})

export class CountryDetailsComponent {
  @Input() item: Country | undefined;
  @Input() isLoading: boolean = false;
  @Input() loadingItem: Country | null = null;
  @Input() isLoaded: boolean = false;
  @Input() loadedItem: Country | null = null;
}
