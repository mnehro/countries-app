import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PopulationResult, Result } from '../models/result.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Result> {
    return this.http.get<Result>(`${this.baseUrl}/flag/images`);
  }
  getSingleCountryPopulation(countryISO3: string): Observable<PopulationResult> {
    return this.http.post<PopulationResult>(`${this.baseUrl}/population`, {
      iso3: countryISO3
    });
  }

}
