import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, CreditCard, Bitcoin, Youtube } from 'lucide-react'; // Using lucide-react for icons
import "./footer.scss";

const Footer = () => {
  // Define primary colors
  const primaryPurple = '#800080'; // A deep purple
  const primaryBlack = '#000000'; // Pure black
  const lightGrey = '#a0a0a0'; // For text

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 rounded-t-xl mt-12">
      <style>{`
        /* Custom styles for better integration with the theme */
        .footer-link {
          @apply text-gray-400 hover:text-purple-400 transition-colors duration-200;
        }
        .footer-heading {
          @apply text-lg font-semibold text-purple-500 mb-4;
        }
        .icon-link {
          @apply text-gray-400 hover:text-purple-400 transition-colors duration-200;
        }
        .payment-logo {
            /* All logos are now 20px by 20px */
            height: 20px;
            width: 20px;
            object-fit: contain; /* Ensures the image content is scaled to fit */
            @apply cursor-pointer transition-transform duration-200 hover:scale-105;
        }
      `}</style>
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section 1: About TopMark */}
          <div className="flex flex-col items-start">
            <h3 className="footer-heading" style={{ color: primaryPurple }}>TopMark</h3>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Empowering academic excellence through comprehensive resources and innovative learning tools. Your success is our mission.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/topmark" target="_blank" rel="noopener noreferrer" className="icon-link">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/topmark" target="_blank" rel="noopener noreferrer" className="icon-link">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/topmark" target="_blank" rel="noopener noreferrer" className="icon-link">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/topmark" target="_blank" rel="noopener noreferrer" className="icon-link">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com/topmark" target="_blank" rel="noopener noreferrer" className="icon-link">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h3 className="footer-heading" style={{ color: primaryPurple }}>Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="footer-link">About Us</a></li>
              <li><a href="/services" className="footer-link">Our Services</a></li>
              <li><a href="/courses" className="footer-link">Courses</a></li>
              <li><a href="/blog" className="footer-link">Blog</a></li>
              <li><a href="/faq" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          {/* Section 3: Legal & Support */}
          <div>
            <h3 className="footer-heading" style={{ color: primaryPurple }}>Legal & Support</h3>
            <ul className="space-y-2">
              <li><a href="/privacy-policy" className="footer-link">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="footer-link">Terms of Service</a></li>
              <li><a href="/refund-policy" className="footer-link">Refund Policy</a></li>
              <li><a href="/disclaimer" className="footer-link">Disclaimer</a></li>
              <li><a href="/support" className="footer-link">Support Center</a></li>
            </ul>
          </div>

          {/* Section 4: Contact & Payments */}
          <div className="flex flex-col items-start">
            <h3 className="footer-heading" style={{ color: primaryPurple }}>Contact & Payments</h3>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-purple-400" />
                <span>info@topmark.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-purple-400" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-purple-400" />
                <span>123 Academic Way, Learning City, LC 98765</span>
              </li>
            </ul>

            <h4 className="font-medium text-purple-400 mb-3">Accepted Payment Methods</h4>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Using CreditCard icon for generic card payments */}
              <CreditCard size={20} className="text-gray-400 hover:text-purple-400 transition-colors duration-200 cursor-pointer" title="Credit/Debit Cards" />

              {/* PayPal Logo */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal Logo"
                className="payment-logo"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/20x20/800080/FFFFFF?text=P"; }}
                title="PayPal"
              />

              {/* Visa Logo */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                alt="Visa Logo"
                className="payment-logo"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/20x20/800080/FFFFFF?text=V"; }}
                title="Visa"
              />

              {/* Mastercard Logo */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png"
                alt="Mastercard Logo"
                className="payment-logo"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/20x20/800080/FFFFFF?text=M"; }}
                title="Mastercard"
              />

              {/* Bitcoin icon (if desired, from lucide-react) */}
              <Bitcoin size={20} className="text-gray-400 hover:text-purple-400 transition-colors duration-200 cursor-pointer" title="Bitcoin" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TopMark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
