import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// In a real app, these would be loaded asynchronously from JSON files.
const resources = {
  'en-US': {
    translation: {
      search_placeholder: "Search globally for products...",
      cheapest_retailer: "Cheapest Retailer",
      price: "{{val, currency}}",
      region: "Region: United States"
    }
  },
  'en-IN': {
    translation: {
      search_placeholder: "Search for electronics, fashion...",
      cheapest_retailer: "Lowest Price Retailer",
      price: "{{val, currency}}",
      region: "Region: India"
    }
  },
  'de-DE': {
    translation: {
      search_placeholder: "Nach Produkten suchen...",
      cheapest_retailer: "Günstigster Händler",
      price: "{{val, currency}}",
      region: "Region: Deutschland"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en-IN', // default region
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // react already safes from xss
      format: (value, format, lng) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, { 
            style: 'currency', 
            currency: lng === 'en-IN' ? 'INR' : lng === 'de-DE' ? 'EUR' : 'USD' 
          }).format(value);
        }
        return value;
      }
    }
  });

export default i18n;
