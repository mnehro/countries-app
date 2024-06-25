import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, heart, heartOutline, trash, trashOutline } from 'ionicons/icons';
import { CountryService } from '../services/country.service';
import { Country, GroupedCountry } from '../models/country.model';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import { Constants } from '../models/enums.model';
import { CountryDetailsComponent } from '../components/country-details/country-details.component';
import { SlideFavoriteComponent } from '../components/slide-favorite/slide-favorite.component';

addIcons({
  'heart': heart,
  'heart-outline': heartOutline,
  'trash': trash,
  'trash-outline': trashOutline,
  'arrow-forward': arrowForward
});
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CountryDetailsComponent, SlideFavoriteComponent]
})
export class HomePage implements OnDestroy {
  @ViewChild('searchBar', { static: false }) searchBar!: IonSearchbar;

  letters: string[] = [];

  countries: Country[] = [];
  baseCountries: Country[] = [];
  favourites: Set<string> = new Set();

  groupedCountries: GroupedCountry = {};
  baseBackupGroupedCountries: GroupedCountry = {};

  isHomePage: boolean = true;
  isLoading: boolean = false;
  isLoaded: boolean = false;

  loadingItem: Country | null = null;
  loadedItem: Country | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private countryService: CountryService) { }

  ngAfterViewInit(): void {
    Promise.all([this.loadCountries(), this.loadFavourites()]).catch((error) => {
      this.handleError(error);
    })
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCountries(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sub = this.countryService.getCountries().pipe(
        catchError(async (error) => {
          reject(error);
          this.handleError(error);
        }),
        tap(result => {
          if (result && !result.error) {
            this.handleLoadCountriesSuccess(result.data);
            resolve();
          }
        })
      ).subscribe();
      this.subscriptions.push(sub);
    });

  }
  private handleLoadCountriesSuccess(data: Country[]): void {
    this.countries = data;
    this.baseCountries = data;
    this.groupCountries();
    this.createLetters();
    this.baseBackupGroupedCountries = { ...this.groupedCountries };
  }

  private handleError(error: any): Observable<any> {
    console.error('Error loading countries:', error);
    return of(null);
  }

  private loadFavourites(): Promise<void> {
    return new Promise((resolve) => {
      const favouritesArray: string[] = JSON.parse(localStorage.getItem('favourites') ?? '[]');
      this.favourites = new Set(favouritesArray);
      resolve();
    });
  }

  private groupCountries(): void {
    this.groupedCountries = {};
    this.countries.forEach(country => {
      const letter = country.name.charAt(0).toUpperCase();
      this.groupedCountries[letter] = this.groupedCountries[letter] || [];
      country.iso3 !== Constants.ISR && this.groupedCountries[letter].push(country);
    });
  }

  private createLetters() {
    this.letters = [...Object.keys(this.groupedCountries || {}).sort()];
  }

  private updatedLoadingState(item: Country): void {
    Object.assign(this, {
      isLoaded: true,
      isLoading: false,
      loadedItem: item,
      loadingItem: null
    });
  }

  private addToFavorites(item: Country): void {
    this.favourites.add(item.iso3);
  }

  favIncludesItem(item: Country): boolean {
    return this.favourites.has(item.iso3);
  }

  private removeFromFavorites(item: Country): void {
    this.favourites.delete(item.iso3);
  }

  private updateView(): void {
    this.groupedCountries = !this.isHomePage
      ? {
        ...this.baseBackupGroupedCountries,
      }
      : {};

    this.countries = this.isHomePage
      ? [...this.baseCountries]
      : this.baseCountries.filter(country => this.favourites.has(country.iso3));

    this.groupCountries();
    this.createLetters();
  }

  filterCountries(searchBarValue: string | undefined | null): void {
    const query = (searchBarValue ?? '').toLowerCase().trim();
    this.countries = this.isHomePage
      ? this.baseCountries.filter(country => country.name.toLowerCase().includes(query))
      : this.baseCountries.filter(country => this.favourites.has(country.iso3) && country.name.toLowerCase().includes(query));
    this.groupCountries();
    this.createLetters();
  }

  toggleView(): void {
    this.isHomePage = !this.isHomePage ?? false;
    this.filterCountries(this.searchBar?.value);
  }

  viewMore(item: Country): void {
    this.loadingItem = item;
    this.isLoading = true;

    const cachedData = localStorage.getItem(`population_${item.iso3}`);
    cachedData ? this.handleCachedPopulation(item, cachedData) : this.fetchPopulation(item);
  }
  private handleCachedPopulation(item: Country, cachedData: string): void {
    item.population = JSON.parse(cachedData);
    this.updatedLoadingState(item);
  }
  private fetchPopulation(item: Country): void {
    const sub = this.countryService.getSingleCountryPopulation(item.iso3).subscribe({
      next: (result) => {
        if (!result.error) {
          const latestPopulation = result.data.populationCounts?.slice(-1)[0];
          item.population = latestPopulation;
          localStorage.setItem(`population_${item.iso3}`, JSON.stringify(latestPopulation));
        }
        this.updatedLoadingState(item);
      },
      error: () => {
        item.population = { value: 0 };
        this.updatedLoadingState(item);
      },
      complete: () => {
        if (!item.population) {
          item.population = { value: 0 };
        }
        this.updatedLoadingState(item);
      }
    });
    this.subscriptions.push(sub);

  }


  onImageError(event: any): void {
    event.target.src = Constants.defaultImage;
  }

  onItemDrag(event: any, item: Country): void {
    const side: string = event.detail.side;
    if (side === 'end') {
      this.removeFromFavorites(item);
      this.updateView();
    } else if (side === 'start') {
      this.addToFavorites(item);
    }
    this.filterCountries(this.searchBar.value);
    localStorage.setItem('favourites', JSON.stringify([...this.favourites]));

  }

  scrollToLetter(letter: string): void {
    (document.getElementById(letter) as HTMLElement)?.scrollIntoView({ behavior: 'smooth' });
  }
}
