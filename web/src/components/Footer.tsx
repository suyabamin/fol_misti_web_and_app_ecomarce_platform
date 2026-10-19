import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, Truck, Package, Headphones } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      {/* Top Banner Ribbon from reference image */}
      <div className="footer-top-ribbon">
        <div className="container ribbon-inner">
          <div className="ribbon-brand">
            <span className="ribbon-icon">🥭</span>
            <span className="ribbon-text">
              ফল মিষ্টি - স্বাস্থ্যকর ফল ও সুস্বাদু মিষ্টি, আপনার পরিবারের জন্য ❤️
            </span>
          </div>
          <div className="ribbon-features">
            <div className="ribbon-feat">
              <CheckCircle2 size={16} />
              <span>100% Fresh</span>
            </div>
            <div className="ribbon-feat">
              <ShieldCheck size={16} />
              <span>Premium Quality</span>
            </div>
            <div className="ribbon-feat">
              <Package size={16} />
              <span>Hygienically Packed</span>
            </div>
            <div className="ribbon-feat">
              <Truck size={16} />
              <span>On Time Delivery</span>
            </div>
            <div className="ribbon-feat">
              <Headphones size={16} />
              <span>Happy Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container footer-main">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="footer-logo-bangla">ফল মিষ্টি</span>
              <span className="footer-logo-eng">Fol Mishti</span>
            </div>
            <p className="footer-desc">
              বাংলাদেশের সেরা ও পরীক্ষিত বাগান থেকে সংগৃহীত রাসায়নিকমুক্ত মৌসুমি ফল এবং শতবর্ষের খাঁটি ছানার মিষ্টির অনলাইন প্ল্যাটফর্ম।
            </p>
            <div className="footer-contact-items">
              <div className="footer-contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+880 1712-345678</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} className="contact-icon" />
                <span>support@folmishti.com</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} className="contact-icon" />
                <span>বাড়ি ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4 className="footer-title">পণ্য ক্যাটাগরি</h4>
            <ul className="footer-links">
              <li><Link to="/fruits">তাজা মৌসুমি ফল</Link></li>
              <li><Link to="/sweets">ঐতিহ্যবাহী মিষ্টি</Link></li>
              <li><Link to="/shop?category=mango-collection">আমের মেলা (Mangoes)</Link></li>
              <li><Link to="/shop?category=sweet-boxes">উপহার ও মিষ্টি বক্স</Link></li>
              <li><Link to="/offers">বিশেষ অফার ও কুপন</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-col">
            <h4 className="footer-title">গ্রাহক সেবা ও নীতি</h4>
            <ul className="footer-links">
              <li><Link to="/order-tracking">অর্ডার ট্র্যাকিং</Link></li>
              <li><Link to="/shipping-policy">শিপিং পলিসি</Link></li>
              <li><Link to="/return-refund">রিটার্ন ও রিফান্ড নীতি</Link></li>
              <li><Link to="/privacy-policy">প্রাইভেসি পলিসি</Link></li>
              <li><Link to="/terms">ব্যবহারের শর্তাবলী</Link></li>
              <li><Link to="/faq">সচরাচর জিজ্ঞাসা (FAQ)</Link></li>
            </ul>
          </div>

          {/* Trust & COD */}
          <div className="footer-col">
            <h4 className="footer-title">নিরাপদ পেমেন্ট ও ডেলিভারি</h4>
            <p className="footer-desc">
              পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করুন।
            </p>
            <div className="cod-badge-box">
              <span className="cod-title">ক্যাশ অন ডেলিভারি (COD)</span>
              <span className="cod-sub">সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি</span>
            </div>
            <div className="social-links-wrap">
              <span className="social-title">আমাদের সাথে থাকুন:</span>
              <div className="social-pills">
                <span className="social-pill">Facebook</span>
                <span className="social-pill">Instagram</span>
                <span className="social-pill">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} ফল মিষ্টি (Fol Mishti). সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="made-with-love">বাংলাদেশে তৈরি • ১০০% খাঁটি পণ্য</p>
        </div>
      </div>
    </footer>
  );
};
