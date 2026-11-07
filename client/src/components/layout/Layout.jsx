import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="py-4">
        <div className="container">{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;
