import React, { useEffect } from 'react';

const Projects = () => {
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
        <div className='fade-in'>
            <ul>
                <li>
                    <h3>Image classifiers using machine learning (CNN)</h3>
                    <p>This project involves building a convolutional neural network (CNN) to classify images into
                        various categories. Using a labeled dataset, the model learns features from the images through
                        multiple layers, allowing it to accurately predict the class of new, unseen images. This is
                        commonly used in applications like facial recognition, object detection, and medical image
                        analysis.</p>
                </li>
                <li>
                    <h3>Online Voting System (EVM) (php)</h3>
                    <p>This project is designed to create a secure online voting system that simulates the Electronic
                        Voting Machine (EVM) process. It allows users to cast their votes securely and anonymously via a
                        web interface built with PHP. The system would include features for user authentication, vote
                        verification, and results tallying, ensuring transparency and integrity in the voting process.
                    </p>
                </li>
                <li>
                    <h3>AI gym trainer (randomforst) (b.tech mini project)</h3>
                    <p>This application uses the Random Forest algorithm to create a personalized gym training program.
                        By analyzing user data such as fitness levels, goals, and preferences, the AI provides
                        recommendations for workouts and nutrition. The model can continuously improve its suggestions
                        based on user feedback and progress, making it an effective virtual trainer.</p>
                </li>
                <li>
                    <h3>Online Web stores (php)</h3>
                    <p>This project involves creating a fully functional e-commerce platform using PHP. The website
                        allows users to browse products, add them to a shopping cart, and make purchases. Features
                        typically include user authentication, product management, payment integration, and order
                        tracking. This system aims to provide a seamless shopping experience for customers.</p>
                </li>
                <li>
                    <h3>College Events websites (php/node)</h3>
                    <p>This website serves as a platform for managing and promoting college events. Built with PHP or
                        Node.js, it allows students to create, manage, and RSVP for events. Features may include event
                        calendars, notifications, and social sharing options, enhancing student engagement and
                        participation in college activities.</p>
                </li>
                <li>
                    <h3>Number Classification (CNN)</h3>
                    <p>Similar to image classification, this project focuses on classifying numerical data (e.g.,
                        handwritten digits from the MNIST dataset) using a CNN. The model learns to recognize patterns
                        in the numerical data, achieving high accuracy in identifying different digits. This project is
                        a common introduction to deep learning techniques.</p>
                </li>
                <li>
                    <h3>Speech Emotion Recolonization</h3>
                    <p>This project utilizes Long Short-Term Memory (LSTM) networks to classify emotions from speech
                        data. By analyzing audio features such as pitch, tone, and rhythm, the model predicts the
                        emotional state (e.g., happy, sad, angry) of the speaker. This technology can be applied in
                        customer service, therapy, and human-computer interaction.</p>
                </li>
                <li>
                    <h3>Sentiment analysis from movie reviews</h3>
                    <p>Using LSTM networks, this project aims to analyze the sentiment of movie reviews (positive,
                        negative, or neutral). The model processes textual data, learning from contextual information to
                        make predictions about the overall sentiment. This application is valuable for businesses to
                        gauge public opinion on films and improve marketing strategies.</p>
                </li>
                <li>
                    <h3>Virtual Assistant For Visually Impaired (b.tech final year major project)</h3>
                    <p>This comprehensive project integrates multiple machine learning models, including CNNs for image
                        recognition, LSTMs for processing speech, and Transformers for understanding natural language.
                        The virtual assistant aids visually impaired individuals by recognizing their operations through
                        webwroesing and operations that are done through a system in the web, converting text to speech,
                        and providing real-time information, enhancing their independence and navigation.</p>
                </li>
            </ul>
        </div>
    );
}

export default Projects;
