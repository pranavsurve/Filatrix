import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
  file?: File;
}

export interface ProductUploadData {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: File[];
  modelFile: File;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  printSettings?: {
    layerHeight: string;
    infill: string;
    material: string;
  };
}

@Component({
  selector: 'app-product-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './product-upload.component.html',
  styleUrls: ['./product-upload.component.scss']
})
export class ProductUploadComponent implements OnInit {
  @Input() categories: string[] = [
    'Art',
    'Toys',
    'Home',
    'Tools',
    'Jewelry',
    'Other'
  ];

  @Input() isSubmitting = false;
  @Input() submitLabel = 'Upload Product';

  @Output() formSubmit = new EventEmitter<ProductUploadData>();
  @Output() cancel = new EventEmitter<void>();

  uploadForm!: FormGroup;
  imageFiles: UploadedFile[] = [];
  modelFile: UploadedFile | null = null;

  allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  allowedModelTypes = ['.stl', '.obj'];
  maxImageSize = 5 * 1024 * 1024; // 5MB
  maxModelSize = 50 * 1024 * 1024; // 50MB

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000)
      ]],
      price: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      category: ['', Validators.required],
      tags: [''],
      dimensions: this.fb.group({
        width: [''],
        height: [''],
        depth: ['']
      }),
      printSettings: this.fb.group({
        layerHeight: [''],
        infill: [''],
        material: ['']
      })
    });
  }

  get f() {
    return this.uploadForm.controls;
  }

  get tagsArray(): string[] {
    const tagsValue = this.uploadForm.get('tags')?.value || '';
    return tagsValue.split(',').map((t: string) => t.trim()).filter((t: string) => t);
  }

  // Image handling
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.validateAndAddImages(files);
  }

  onDropImages(event: DragEvent): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.validateAndAddImages(files);
  }

  validateAndAddImages(files: File[]): void {
    for (const file of files) {
      if (!this.allowedImageTypes.includes(file.type)) {
        this.showError(`${file.name}: Invalid file type. Use JPG, PNG, or WebP.`);
        continue;
      }
      if (file.size > this.maxImageSize) {
        this.showError(`${file.name}: File too large. Max 5MB.`);
        continue;
      }
      if (this.imageFiles.length >= 5) {
        this.showError('Maximum 5 images allowed.');
        break;
      }

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type
      };

      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      uploadedFile.file = file;
      this.imageFiles.push(uploadedFile);
    }
  }

  removeImage(index: number): void {
    if (this.imageFiles[index]?.preview) {
      URL.revokeObjectURL(this.imageFiles[index].preview!);
    }
    this.imageFiles.splice(index, 1);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Model file handling
  onModelSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.validateAndSetModel(file);
  }

  onDropModel(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.validateAndSetModel(file);
    }
  }

  validateAndSetModel(file: File): void {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedModelTypes.includes(ext)) {
      this.showError(`${file.name}: Invalid file type. Use STL or OBJ.`);
      return;
    }
    if (file.size > this.maxModelSize) {
      this.showError(`${file.name}: File too large. Max 50MB.`);
      return;
    }

    this.modelFile = {
      name: file.name,
      size: file.size,
      type: ext.replace('.', ''),
      file
    };
  }

  removeModel(): void {
    this.modelFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Form submission
  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      this.showError('Please fill in all required fields correctly.');
      return;
    }

    if (this.imageFiles.length === 0) {
      this.showError('Please upload at least one image.');
      return;
    }

    if (!this.modelFile?.file) {
      this.showError('Please upload a 3D model file (STL/OBJ).');
      return;
    }

    const formValue = this.uploadForm.value;
    const tagsArray = formValue.tags
      ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : [];

    const productData: ProductUploadData = {
      title: formValue.title,
      description: formValue.description,
      price: parseFloat(formValue.price),
      category: formValue.category,
      tags: tagsArray,
      images: this.imageFiles.map(f => f.file!).filter(f => f),
      modelFile: this.modelFile.file!,
      dimensions: formValue.dimensions?.width ? formValue.dimensions : undefined,
      printSettings: formValue.printSettings?.layerHeight ? formValue.printSettings : undefined
    };

    this.formSubmit.emit(productData);
  }

  onCancel(): void {
    this.uploadForm.reset();
    this.imageFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    this.imageFiles = [];
    this.modelFile = null;
    this.cancel.emit();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // Validation error messages
  getErrorMessage(field: string): string {
    const control = this.uploadForm.get(field);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['pattern']) return 'Invalid format. Use numbers (e.g., 29.99)';

    return 'Invalid input';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.uploadForm.get(field);
    return control ? control.invalid && control.touched : false;
  }
}