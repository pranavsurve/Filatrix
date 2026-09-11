import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  showcaseImages = [
    {
      src: 'assets/images/filatrix-logo.jpg',
      alt: 'FilatrixStudio brand',
      title: 'FilatrixStudio',
      caption: 'Premium 3D print marketplace & maker studio'
    },
    {
      src: 'assets/images/pexels-papaz-30620861.jpg',
      alt: '3D printing in action',
      title: 'Precision Printing',
      caption: 'Industrial-grade equipment for every design'
    },
    {
      src: 'assets/images/filatrix-logo.jpg',
      alt: 'FilatrixStudio workshop',
      title: 'Maker Community',
      caption: 'Buy unique prints or sell your own creations'
    }
  ];

  features = [
    {
      icon: 'precision_manufacturing',
      title: 'In-House Manufacturing',
      description: 'Every print is produced in our own facility using industrial-grade equipment — no third-party outsourcing.'
    },
    {
      icon: 'upload_file',
      title: 'Upload Your Design',
      description: 'Send us your STL or OBJ file and we\'ll handle the rest — from print to delivery.'
    },
    {
      icon: 'verified',
      title: 'Quality Guaranteed',
      description: 'Multi-stage quality checks ensure every piece meets our standards before it ships.'
    },
    {
      icon: 'bolt',
      title: 'Fast Turnaround',
      description: 'Optimized production workflows deliver reliable lead times without compromising on quality.'
    }
  ];
}