import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

console.log('Starting the bootstrap process');  // Log before bootstrap

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    console.log('bootstrapModule completed');  // Log after bootstrap is completed
  })
  .catch((err) => console.error('Bootstrap error:', err));  // Log errors if any occur
