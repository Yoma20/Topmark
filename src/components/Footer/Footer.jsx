import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import visaLogo from '../../assets/payment/visa.svg';
import mastercardLogo from '../../assets/payment/mastercard.svg';
import paypalLogo from '../../assets/payment/paypal.svg';
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        {/* ── Top grid ── */}
        <div className="site-footer__grid">

          {/* Brand */}
          <div className="site-footer__col site-footer__col--brand">
            <span className="site-footer__logo">TopMark</span>
            <p className="site-footer__tagline">
              Empowering academic excellence through expert help and innovative learning tools.
            </p>
            <div className="site-footer__socials">
              <a href="https://facebook.com/topmark" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://twitter.com/topmark" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="https://instagram.com/topmark" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://linkedin.com/company/topmark" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="https://youtube.com/topmark" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="site-footer__col">
            <h4 className="site-footer__heading">Quick Links</h4>
            <ul className="site-footer__list">
              <li><a href="/about">About Us</a></li>
              <li><a href="/services">Our Services</a></li>
              <li><a href="/gigs">Browse Gigs</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="site-footer__col">
            <h4 className="site-footer__heading">Legal & Support</h4>
            <ul className="site-footer__list">
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
              <li><a href="/support">Support Center</a></li>
            </ul>
          </div>

          {/* Contact & Payments */}
          <div className="site-footer__col">
            <h4 className="site-footer__heading">Contact</h4>
            <ul className="site-footer__contact">
              <li><Mail size={15} /><span>info@topmark.pro</span></li>
              <li><Phone size={15} /><span>+1 (123) 456-7890</span></li>
              <li><MapPin size={15} /><span>123 Academic Way, Learning City</span></li>
            </ul>

            <h4 className="site-footer__heading" style={{ marginTop: '20px' }}>We Accept</h4>
            <div className="site-footer__payments">
              <img src={visaLogo} alt="Visa" />
              <img src={mastercardLogo} alt="Mastercard" />
              <img src={paypalLogo} alt="PayPal" />
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="site-footer__bottom">
          <p>&copy; {new Date().getFullYear()} TopMark. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;