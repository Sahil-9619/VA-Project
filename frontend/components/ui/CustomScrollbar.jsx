"use client";

import React from "react";

export default function CustomScrollbar({ children, className = "", ...props }) {
  return (
    <div
      className={`custom-scrollbar overflow-y-auto overflow-x-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
