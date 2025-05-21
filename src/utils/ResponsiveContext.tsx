import React, { createContext, useContext, useState, useEffect } from "react";

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultContext: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isSidebarOpen: true,
  toggleSidebar: () => {},
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultContext);

export const useResponsive = () => useContext(ResponsiveContext);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  // Start with the sidebar closed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Log initial values for debugging
  console.log("Initial Responsive State:", {
    width: window.innerWidth,
    isMobile,
    isTablet,
    isDesktop,
  });

  const toggleSidebar = () => {
    console.log("Toggle sidebar called, current state:", isSidebarOpen);
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      console.log("Sidebar will be:", newState ? "open" : "closed");
      return newState;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      const newIsTablet = width >= 768 && width < 1024;
      const newIsDesktop = width >= 1024;

      console.log("Window resized:", {
        width,
        newIsMobile,
        newIsTablet,
        newIsDesktop,
      });

      setIsMobile(newIsMobile);
      setIsTablet(newIsTablet);
      setIsDesktop(newIsDesktop);

      // No auto-opening/closing sidebar based on screen size
      // The user will control this with the toggle button
    };

    // Initial call to ensure state is set correctly
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ResponsiveContext.Provider
      value={{
        isMobile,
        isTablet,
        isDesktop,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

export default ResponsiveContext;
