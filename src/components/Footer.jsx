import { Facebook, Instagram, Twitter, Mail, Info } from 'lucide-react';
import '../styles/Footer.css';

/**
 * @component Footer
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p><Mail size={16} /> info@gemstonebusiness.com</p>
          <p>123 Gem Street, Diamond City</p>
          <p>+1 (555) 123-4567</p>
        </div>
        
        <div className="footer-section">
          <h3>About Us</h3>
          <p><Info size={16} /> We provide the finest quality gemstones for all your jewelry needs. Authenticity guaranteed.</p>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" className="social-icon"><Facebook size={24} /></a>
            <a href="#" className="social-icon"><Instagram size={24} /></a>
            <a href="#" className="social-icon"><Twitter size={24} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Gemstone Business. All rights reserved.</p>
        <p className="footer-dev">
          Developed by{" "}
          <a
            href="https://geethanuradha.github.io/"
            target="_blank"
            rel="noreferrer"
            className="footer-dev-link"
          >
            Anusys
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
