import React, { useEffect, useRef } from 'react';

const EmbedHandler: React.FC<{ embedCode: string }> = ({ embedCode }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && embedCode) {
            // Clear any previous embed
            ref.current.innerHTML = "";
            
            // Parse the embed code string into a document fragment. This is safer than directly
            // using innerHTML with scripts, as it doesn't execute them immediately.
            const fragment = document.createRange().createContextualFragment(embedCode);
            
            // Find any script tags in the fragment
            const scripts = Array.from(fragment.querySelectorAll('script'));
            
            // Append the non-script part of the fragment to our component's div
            ref.current.appendChild(fragment);
            
            // For each script, create a new script element and append it.
            // This is necessary because scripts inserted via innerHTML or as a fragment
            // are not executed by the browser for security reasons. We must create
            // new script elements and append them to the DOM to trigger execution.
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                
                // Copy all attributes (like src, async, defer) from the original script
                for (const attr of script.attributes) {
                    newScript.setAttribute(attr.name, attr.value);
                }
                
                // Copy the inline script content
                if (script.innerHTML) {
                    newScript.innerHTML = script.innerHTML;
                }
                
                // Append the new script to the container. The browser will now execute it.
                ref.current?.appendChild(newScript);
            });
        } else if (ref.current) {
            // If embedCode is empty, clear the container
            ref.current.innerHTML = "";
        }
    }, [embedCode]);

    return <div ref={ref} className="w-full h-full" />;
};

export default EmbedHandler;
