import React, { useEffect } from 'react';

const Contact = () => {

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
        <form action="#contact" className='fade-in'>
            <label htmlFor="first_name">First name</label>
            <input type="text" name="first_name" placeholder="First Name" />
            <label htmlFor="middle_name">Middle name</label>
            <input type="text" name="middle_name" placeholder="Middle Name" />
            <label htmlFor="last_name">Last name</label>
            <input type="text" name="last_name" placeholder="Last Name" />
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" placeholder="Email Id" />
            <label htmlFor="phnumber">Phone Number</label>
            <input type="number" name="phnumber" id="phnumber" placeholder="Phone Number" />
            <input type="submit" value="Contact" />
        </form>
    );
}

export default Contact;
