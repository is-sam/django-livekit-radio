"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../app/(auth)/AuthProvider";
import navbarStyles from "./navbar.module.css";
import { User2 } from "lucide-react";

export default function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles.navbarTitle}>
        <a href="/">
          Django LiveKit <span className={navbarStyles.navbarRadioAccent}>Radio</span>
        </a>
      </div>
      {isAuthenticated && user && (
        <div ref={dropdownRef} className={navbarStyles.navbarUser}>
          <button
            className={dropdownOpen ? `${navbarStyles.navbarUserBtn} open` : navbarStyles.navbarUserBtn}
            onClick={() => setDropdownOpen((open) => !open)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <User2 size={20} style={{ marginRight: "0.3rem" }} />
            {user.username ? user.username : `User #${user.id}`} <span style={{ marginLeft: "0.5rem" }}>▼</span>
          </button>
          {dropdownOpen && (
            <div className={navbarStyles.navbarDropdown}>
              {user.is_admin && (
                <button
                  onClick={() => window.location.href = "/admin"}
                  className={navbarStyles.navbarAdminBtn}
                >
                  Admin Page
                </button>
              )}
              <button
                onClick={logout}
                className={navbarStyles.navbarLogoutBtn}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
