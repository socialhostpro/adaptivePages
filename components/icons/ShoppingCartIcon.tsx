import React from 'react';

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.344 1.087-.835l1.823-6.84a1.06 1.06 0 00-.44-1.222l-1.423-.853A.63.63 0 0018.53 5.5H5.25L4.817 4.077A1.06 1.06 0 003.75 3H2.25zM4.5 21a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm12.75 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
    />
  </svg>
);

export default ShoppingCartIcon;
