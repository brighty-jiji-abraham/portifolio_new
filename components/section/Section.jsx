import React, { useEffect } from 'react';

function Section({ children , id }) {

  useEffect(() => {
          const elements = document.querySelectorAll('.fade-in');
          const timeout = setTimeout(() => {
              elements.forEach(element => {
                  element.classList.remove('fade-in');
              });
          }, 2000); // Adjust the timeout duration as needed
  
          return () => clearTimeout(timeout);
      }, []);

  return (
    <div className="container2 fade-in" id={id}>
        {children}
    </div>
  );
}

export default Section;
