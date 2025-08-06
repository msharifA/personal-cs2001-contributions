import React from 'react';

const Header = ({ userRole }) => {
  // Hide the header if the user is an admin
  if (userRole === 'admin') {
    return null;
  }

  return (
    <header>
      {/* ...existing code for the header content... */}
    </header>
  );
};

export default Header;