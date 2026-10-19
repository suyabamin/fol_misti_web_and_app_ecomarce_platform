import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CustomerLiveChat } from '../components/CustomerLiveChat';
import './CustomerLayout.css';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="customer-site-wrapper">
      <AnnouncementBar />
      <Header />
      <main className="customer-main-content">
        <Outlet />
      </main>
      <CustomerLiveChat />
      <Footer />
    </div>
  );
};
