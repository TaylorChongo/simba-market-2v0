import { Mail, Globe, MessageSquare, Info } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold">Simba <span className="text-primary">Supermarket</span></span>
          </div>
          <p className="text-outline text-sm leading-relaxed max-w-xs">
            {t('footer_desc')}
          </p>
        </div>

        {/* Links */}
        <div className="col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('shop')}</h4>
          <ul className="space-y-2 text-xs md:text-sm text-outline font-medium">
            <li><a href="#" className="hover:text-primary transition-colors">{t('groceries')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('electronics')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('home_kitchen')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('personal_care')}</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('support')}</h4>
          <ul className="space-y-2 text-xs md:text-sm text-outline font-medium">
            <li><a href="#" className="hover:text-primary transition-colors">{t('contact_us')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('faqs')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('shipping_policy')}</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">{t('returns')}</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('stay_updated')}</h4>
          <p className="text-xs md:text-sm text-outline mb-4">{t('newsletter_desc')}</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors">
              <Info className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-outline-variant py-6 text-center text-sm text-outline">
        <p>&copy; {new Date().getFullYear()} Simba Supermarket. {t('all_rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
