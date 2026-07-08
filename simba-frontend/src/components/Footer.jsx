import { Globe, MessageSquare, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold">Simba <span className="text-primary">Supermarket</span></span>
          </Link>
          <p className="text-outline text-sm leading-relaxed max-w-xs mb-5">
            {t('footer_desc')}
          </p>
          <div className="flex gap-2">
            <Link to="/shipping-policy">
              <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors" title={t('shipping_policy')}>
                <Globe className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors" title={t('contact_us')}>
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" className="p-2 border border-outline-variant hover:bg-surface-container-high transition-colors" title={t('faqs')}>
                <Info className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Shop links */}
        <div className="col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('shop')}</h4>
          <ul className="space-y-2 text-xs md:text-sm text-outline font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">{t('groceries')}</Link></li>
            <li><Link to="/category/Kitchenware%20%26%20Electronics" className="hover:text-primary transition-colors">{t('electronics')}</Link></li>
            <li><Link to="/category/Kitchen%20Storage" className="hover:text-primary transition-colors">{t('home_kitchen')}</Link></li>
            <li><Link to="/category/Cosmetics%20%26%20Personal%20Care" className="hover:text-primary transition-colors">{t('personal_care')}</Link></li>
          </ul>
        </div>

        {/* Support links */}
        <div className="col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('support')}</h4>
          <ul className="space-y-2 text-xs md:text-sm text-outline font-medium">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">{t('contact_us')}</Link></li>
            <li><Link to="/faq" className="hover:text-primary transition-colors">{t('faqs')}</Link></li>
            <li><Link to="/branches" className="hover:text-primary transition-colors">Our Branches</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">{t('shipping_policy')}</Link></li>
            <li><Link to="/returns" className="hover:text-primary transition-colors">{t('returns')}</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-outline-variant py-6 text-center text-sm text-outline">
        <p>&copy; {new Date().getFullYear()} Simba Supermarket. {t('all_rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
