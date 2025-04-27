"use client";

import { useEffect } from 'react';

export default function GoogleTranslate() {
    useEffect(() => {
        // Create Google Translate script element
        const googleTranslateScript = document.createElement('script');
        googleTranslateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        googleTranslateScript.async = true;
        document.body.appendChild(googleTranslateScript);

        // Initialize the translate element
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en', // Your site's default language
                    includedLanguages: 'hi,bn,te,ta,mr,gu,kn,ml,pa,ur,en,es,fr,zh-CN,ar,ru,pt,de,ja',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                'google_translate_element' // The ID where the widget will appear
            );
        };

        // Clean up on unmount
        return () => {
            if (document.body.contains(googleTranslateScript)) {
                document.body.removeChild(googleTranslateScript);
            }
            delete window.googleTranslateElementInit;
        };
    }, []);

    return <div id="google_translate_element" className="fixed top-4 right-4 z-50 bg-white/80 rounded shadow p-2" />;
}