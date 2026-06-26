"use client";

import { Languages } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const GoogleTranslate = () => {
  const [showTranslate, setShowTranslate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN"); // Default language
  const buttonRef = useRef(null);
  const translateContainerRef = useRef(null);
  const languageCodeRef = useRef("EN"); // Keep a ref to prevent translation of the code

  // Map of language codes to display codes
  const langMap = {
    en: "EN", // English
    ne: "NE", // Nepali
    hi: "HI", // Hindi
    kn: "KN", // Kannada
    ml: "ML", // Malayalam
    ta: "TA", // Tamil
    te: "TE", // Telugu
    fr: "FR", // French
    es: "ES", // Spanish
    de: "DE", // German
    it: "IT", // Italian
    ja: "JA", // Japanese
    ko: "KO", // Korean
    zh: "ZH", // Chinese (Simplified)
    ru: "RU", // Russian
    ar: "AR", // Arabic
    pt: "PT", // Portuguese
    id: "ID", // Indonesian
    vi: "VI", // Vietnamese
    th: "TH", // Thai
    tr: "TR", // Turkish
    pa: "PA", // Punjabi
    gu: "GU", // Gujarati
    mr: "MR", // Marathi
    bn: "BN", // Bengali
  };

  useEffect(() => {
    // Add CSS to hide Google Translate toolbar and customize the appearance
    const style = document.createElement("style");
    style.textContent = `
     
      
      /* Hide the default Google translate trigger icon */
      .goog-te-gadget-icon, .goog-te-gadget-simple img {
        display: none !important;
      }
      
      /* Style the Google translate container */
      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
        font-size: 0 !important;
        cursor: pointer;
      }
      
      /* Style the language dropdown */
      .goog-te-menu-value {
        display: none !important;
      }
      /* Force show the menu when our container is visible */
      #translate-container.show .goog-te-menu-frame {
        display: block !important;
        visibility: visible !important;
      }
      /* Prevent language code from being translated */
      .notranslate {
        white-space: nowrap !important;
      }
    `;
    document.head.appendChild(style);

    const addGoogleTranslateScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: Object.keys(langMap).join(","),
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );

        // Set up a more reliable language change detector
        setupLanguageChangeDetector();
      }
    };

    // More robust language change detection
    const setupLanguageChangeDetector = () => {
      // Initial check for language
      detectCurrentLanguage();

      // Check for Google's translate cookie
      const checkCookie = () => {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
          cookie = cookie.trim();
          // Google Translate stores the selected language in a cookie
          if (cookie.startsWith("googtrans=")) {
            const langCode = cookie.split("/")[2];
            if (langCode && langMap[langCode]) {
              updateLanguage(langCode);
              return;
            }
          }
        }

        // Fallback to checking HTML lang attribute
        detectCurrentLanguage();
      };

      // Set interval to periodically check
      const langCheckInterval = setInterval(checkCookie, 1000);

      // Also monitor DOM changes that might indicate language changes
      const observer = new MutationObserver(() => {
        detectCurrentLanguage();
      });

      // Watch for changes to the html element's lang attribute
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });

      return () => {
        clearInterval(langCheckInterval);
        observer.disconnect();
      };
    };

    // Helper function to detect current language
    const detectCurrentLanguage = () => {
      const htmlElement = document.querySelector("html");
      if (htmlElement) {
        let lang = htmlElement.lang || "en";

        // Google sometimes adds a dash with country code
        if (lang.indexOf("-") !== -1) {
          lang = lang.split("-")[0].toLowerCase();
        }

        updateLanguage(lang);
      }
    };

    // Update language state and reference
    const updateLanguage = (lang) => {
      const displayCode = langMap[lang] || lang.toUpperCase().substring(0, 2);
      languageCodeRef.current = displayCode;
      setSelectedLanguage(displayCode);
    };

    addGoogleTranslateScript();

    // Fix for the body shifting up issue
    const fixBodyPosition = () => {
      if (document.body.style.top) {
        const top = document.body.style.top;
        document.body.style.top = "";
        window.scrollTo(0, parseInt(top || "0"));
      }
    };

    // Check periodically for the body position issue
    const interval = setInterval(fixBodyPosition, 500);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        translateContainerRef.current &&
        !translateContainerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowTranslate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle translate and trigger Google's dropdown
  const toggleTranslate = () => {
    setShowTranslate((prevState) => {
      const newState = !prevState;

      // Use setTimeout to ensure state update has propagated
      if (newState) {
        setTimeout(() => {
          const googleElement = document.querySelector(
            ".goog-te-gadget-simple"
          );
          if (googleElement) {
            googleElement.click();
          }
        }, 100);
      }

      return newState;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleTranslate}
        className="py-2 flex-col transition cursor-pointer z-10"
        ref={buttonRef}
        aria-label="Change language"
      >
        <div className="pointer-events-none">
          <Languages />
          <h6 className="text-[6px] notranslate">{languageCodeRef.current}</h6>
        </div>
      </button>
      {/* Google Translate Dropdown */}
      <div
        id="translate-container"
        ref={translateContainerRef}
        className={`absolute top-0 sm:top-4 sm:right-1.5 -mt-1 p-2 rounded-md transition-all duration-200 z-50 ${
          showTranslate ? "inline-block show" : "hidden"
        }`}
      >
        <div id="google_translate_element" className="bg-transparent"></div>
      </div>
    </div>
  );
};

export default GoogleTranslate;
