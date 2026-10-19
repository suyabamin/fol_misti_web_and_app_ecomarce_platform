import React from 'react';
import { ShieldCheck, Truck, Sparkles, CheckCircle, Clock } from 'lucide-react';
import './AnnouncementBar.css';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="announcement-bar">
      <div className="container announcement-inner">
        <div className="announcement-item">
          <Sparkles size={15} className="announcement-icon" />
          <span>Traditional Bangladeshi Fruit & Sweets Store</span>
        </div>
        <div className="announcement-item">
          <CheckCircle size={15} className="announcement-icon" />
          <span>Fresh & Pure Premium Quality</span>
        </div>
        <div className="announcement-item">
          <Truck size={15} className="announcement-icon" />
          <span>Cash on Delivery All Over Bangladesh</span>
        </div>
        <div className="announcement-item announcement-hide-mobile">
          <ShieldCheck size={15} className="announcement-icon" />
          <span>100% Safe & Secure Payment</span>
        </div>
        <div className="announcement-item announcement-hide-mobile">
          <Clock size={15} className="announcement-icon" />
          <span>Quick & Reliable Fast Delivery</span>
        </div>
      </div>
    </div>
  );
};
