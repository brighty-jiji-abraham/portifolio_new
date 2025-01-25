import React, { useEffect } from 'react';
import { FaLaptopCode, FaReact, FaJava, FaNodeJs, FaPhp, FaPython, FaSwift, FaCss3Alt, FaHtml5, FaJsSquare } from 'react-icons/fa';
import { FaServer } from "react-icons/fa6";
import { BiLogoPhp } from "react-icons/bi";
import { AiFillApi } from "react-icons/ai";
import { GiMusicalKeyboard, GiMeshNetwork } from "react-icons/gi";
import { TbBrandOffice, TbRobot, TbBrandCSharp } from "react-icons/tb";
import { MdBuild, MdDataObject } from 'react-icons/md';
import { GrSwift } from "react-icons/gr";
import { SiCplusplus, SiAdobephotoshop, SiAffinitydesigner, SiAffinityphoto, SiAdobelightroom, SiAdobepremierepro, SiAdobeaftereffects, SiBlender, SiMysql, SiSparkar, SiGithub, SiUnity } from "react-icons/si";
import './Skills.css';

const Skills = () => {

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
        <>
            <div className='fade-in'>
                <h2 className="text-4xl font-extrabold mb-6 text-center">My Skills</h2>
                <div className="skill-list">
                    {/* Programming Languages */}
                    <ul className="skill-card bg-gradient-to-r from-blue-400 to-blue-700 shadow-lg rounded-lg p-6">
                        <strong className="text-2xl font-semibold text-white mb-6">Programming Languages</strong>
                        <li className='clang'><SiCplusplus className="icon" /> C/C++</li>
                        <li className='csharplang'><TbBrandCSharp className="icon" /> C# (C Sharp)</li>
                        <li className='swiftlang'><GrSwift className="icon" /> Swift</li>
                        <li className='phplang'><BiLogoPhp className="icon" /> PHP</li>
                        <li className='javalang'><FaJava className="icon" /> Java</li>
                        <li className='jslang'><FaJsSquare className="icon" /> JavaScript</li>
                        <li className='pythonlang'><FaPython className="icon" /> Python</li>
                        <li className='nodejslang'><FaNodeJs className="icon" /> Node.js</li>
                    </ul>

                    {/* Video Editing / Photography */}
                    <ul className="skill-card bg-gradient-to-r from-green-400 to-green-700 shadow-lg rounded-lg p-6">
                        <strong className="text-2xl font-semibold text-white mb-6">Video Editing / Photography</strong>
                        <li className='ae'><SiAdobeaftereffects className="icon" /> Adobe After Effects</li>
                        <li className='pr'><SiAdobepremierepro className="icon" /> Adobe Premiere Pro</li>
                        <li className='ps'><SiAdobephotoshop className="icon" /> Adobe Photoshop</li>
                        <li className='lr'><SiAdobelightroom className="icon" /> Adobe Lightroom</li>
                        <li className='afd'><SiAffinitydesigner className="icon" /> Affinity Designer</li>
                        <li className='afp'><SiAffinityphoto className="icon" /> Affinity Photo</li>
                    </ul>

                    {/* Other Skills */}
                    <ul className="skill-card bg-gradient-to-r from-purple-400 to-purple-700 shadow-lg rounded-lg p-6">
                        <strong className="text-2xl font-semibold text-white mb-6">Other Skills</strong>
                        <li><TbBrandOffice className="icon" /> Microsoft Office</li>
                        <li><TbRobot className="icon" /> Machine Learning</li>
                        <li><AiFillApi className="icon" /> API Integration</li>
                        <li><MdDataObject className="icon" /> Object-Oriented Programming</li>
                        <li><SiMysql className="icon" /> MySQL</li>
                        <li><GiMeshNetwork className="icon" /> Neural Networks</li>
                        <li><MdBuild className="icon" /> Problem-solving</li>
                        <li><MdBuild className="icon" /> Technical Support</li>
                        <li><FaServer className="icon" /> Web Hosting</li>
                        <li><SiBlender className="icon" /> Blender</li>
                        <li><SiUnity className="icon" /> Unity</li>
                        <li><SiSparkar className="icon" /> Spark AR</li>
                        <li><SiGithub className="icon" /> GitHub</li>
                        <li><GiMusicalKeyboard className="icon" /> FL Studio</li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Skills;