import React, { useEffect } from 'react';
import './About.css';
import profileImg from '../assets/profile-img.jpg'; 
import { FaXTwitter, FaFacebookF, FaInstagram, FaGithub, FaLinkedinIn } from 'react-icons/fa6';

const About = () => {
    useEffect(() => {
        const image = document.querySelector('#about img');
        const h2 = document.querySelector('#about h2');
        let isHovering = false; // Flag to track hover state

        // Function to check overlap
        function checkOverlap() {
            const h2Rect = h2.getBoundingClientRect();
            const imageRect = image.getBoundingClientRect();

            // Check for overlap
            const isOverlapping =
                imageRect.bottom > h2Rect.top &&
                imageRect.top < h2Rect.bottom &&
                imageRect.right > h2Rect.left &&
                imageRect.left < h2Rect.right;

            // Update the h2 class based on overlap
            if (isOverlapping) {
                h2.classList.add('h2-touched');
            }

            // Continue the loop if still hovering
            if (isHovering) {
                requestAnimationFrame(checkOverlap);
            }
            if (!isHovering) {
                h2.classList.remove('h2-touched');
            }
        }

        // Start checking on image hover
        image.addEventListener('mouseenter', function () {
            isHovering = true; // Set flag
            checkOverlap(); // Start continuous checking
        });

        // Stop checking when mouse leaves the image
        image.addEventListener('mouseleave', function () {
            isHovering = false; // Clear flag
            h2.classList.remove('h2-touched'); // Remove class
        });

        // Cleanup event listeners on component unmount
        return () => {
            image.removeEventListener('mouseenter', checkOverlap);
            image.removeEventListener('mouseleave', checkOverlap);
        };
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll('.fade-in');
        const timeout = setTimeout(() => {
            elements.forEach(element => {
                element.classList.remove('fade-in');
            });
        }, 2000); // Adjust the timeout duration as needed

        const socials = document.querySelectorAll('.focus-in-contract-bck');
        const timeout2 = setTimeout(() => {
            socials.forEach(social => {
                social.classList.remove('focus-in-contract-bck');
            });
        }, 4000); // Adjust the timeout duration as needed

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <img src={profileImg} alt="me" className='fade-in'/>
            <div className="bja">
                <h2 className='fade-in'>Brighty Jiji Abraham 👻</h2>
                <p style={{ color: 'rgb(35, 35, 35)' }} className='fade-in'>
                    Passionate AI engineering student seeking impactful opportunities to develop cutting-edge solutions,
                    embrace continuous learning, and drive innovation with ethical AI implementation.
                </p>
                <div className="social-links mt-3 text-center">
                    <a href="https://twitter.com/B_J_A_008" className="twitter focus-in-contract-bck">
                        <FaXTwitter />
                    </a>
                    <a href="https://www.facebook.com/brighty.jiji.abraham/" className="facebook focus-in-contract-bck">
                        <FaFacebookF />
                    </a>
                    <a href="https://www.instagram.com/brighty.jiji.abraham/" className="instagram focus-in-contract-bck">
                        <FaInstagram />
                    </a>
                    <a href="https://github.com/BrightyJijiAbraham" className="github focus-in-contract-bck">
                        <FaGithub />
                    </a>
                    <a href="https://www.linkedin.com/in/brightyjijiabraham/" className="linkedin focus-in-contract-bck">
                        <FaLinkedinIn />
                    </a>
                </div>
            </div>
        </>
    );
};

export default About;