
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-600 py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            &copy; {currentYear} SportStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
