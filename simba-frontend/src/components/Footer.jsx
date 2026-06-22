import { Mail, Globe, MessageSquare, Info, Send, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Input from './Input';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold">Simba <span className="text-primary">Supermarket</span></span>
          </Link>
          <p className="text-outline text-sm leading-relaxed max-w-xs">
            {t('footer_desc')}
          </p>
        </div>

        {/* Links */}
        <div className="col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('shop')}</h4>
          <ul className="space-y-2 text-xs md:text-sm text-outline font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">{t('groceries')}</Link></li>
            <li><Link to="/category/Kitchenware%20%26%20Electronics" className="hover:text-primary transition-colors">{t('electronics')}</Link></li>
            <li><Link to="/category/Kitchen%20Storage" className="hover:text-primary transition-colors">{t('home_kitchen')}</Link></li>
            <li><Link to="/category/Cosmetics%20%26%20Personal%20Care" className="hover:text-primary transition-colors">{t('personal_care')}</Link></li>
          </ul>
        </div>

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

        {/* Newsletter */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold mb-4 text-sm md:text-base">{t('stay_updated')}</h4>
          <p className="text-xs md:text-sm text-outline mb-4">{t('newsletter_desc')}</p>
          
          <div className="min-h-[40px] mb-6">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-2xl border border-success/20 animate-in fade-in zoom-in duration-300">
                <div className="w-5 h-5 bg-success text-white rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" strokeWidth={4} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-10"
                  required
                />
                <Button type="submit" className="h-10 px-3 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>

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
      </div>
      
      <div className="border-t border-outline-variant py-6 text-center text-sm text-outline">
        <p>&copy; {new Date().getFullYear()} Simba Supermarket. {t('all_rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
