import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that scrolls to top when dependencies change
 * Implements smooth scrolling behavior as per user preference
 */
export const useScrollToTop = (dependencies: any[] = []) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, dependencies);
};

/**
 * Custom hook that scrolls to top on route changes
 * Automatically handles navigation-based scrolling
 */
export const useScrollToTopOnRouteChange = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname, location.search]);
};

/**
 * Manual scroll to top function
 * Can be called programmatically when needed
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};