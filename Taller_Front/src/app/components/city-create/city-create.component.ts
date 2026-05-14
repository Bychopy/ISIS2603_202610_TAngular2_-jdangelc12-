import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { CityService } from '../../services/city.service';

/*
 * Implementar: HU-02 — Crear Ciudad
 */

@Component({
  selector: 'app-city-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-create.component.html'
})
export class CityCreateComponent implements OnInit {
  private countryService = inject(CountryService);
  private cityService = inject(CityService);

  @Output() cityCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  countries: Country[] = [];
  cityName = '';
  selectedCountryId: number | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe(
      countries => this.countries = countries
    );
  }

  isFormValid(): boolean {
    return this.cityName.trim().length > 0 && this.selectedCountryId !== null;
  }

  submitForm(): void {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    const newCity = { name: this.cityName };
    this.cityService.createCity(this.selectedCountryId!, newCity).subscribe({
      next: () => {
        this.cityCreated.emit();
        this.resetForm();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.cityName = '';
    this.selectedCountryId = null;
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }
}
