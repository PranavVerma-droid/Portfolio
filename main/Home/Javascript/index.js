/*
    Copyright (C) 2024  Pranav Verma

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    See a more apt description in LICENSE File Attached to the root of this
    project.
*/
const pbIndex = new PocketBase('https://pb-1.pranavv.co.in');

// Initialize general data loading
document.addEventListener('DOMContentLoaded', function() {
    loadGeneralData();
});

// Load general data from PocketBase
async function loadGeneralData() {
    try {
        const generalData = await pbIndex.collection('general').getOne('mq08m3pb8cu9mfo');
        
        // Load profile picture
        if (generalData.profilePic) {
            const profilePicUrl = `https://pb-1.pranavv.co.in/api/files/${generalData.collectionId}/${generalData.id}/${generalData.profilePic}`;
            
            const profileImg = document.getElementById('profileImg');
            if (profileImg) {
                profileImg.src = profilePicUrl;
            }
        }
        
        // Load tagline
        if (generalData.tagline) {
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle) {
                heroSubtitle.textContent = generalData.tagline;
            }
        }
        
        // Load about me text
        if (generalData.about) {
            const aboutMeText = document.getElementById('about-me-text');
            if (aboutMeText) {
                aboutMeText.textContent = generalData.about;
            }
        }
        
    } catch (error) {
        console.error('Failed to load general data:', error);
    }
}

// Show/hide sections for modern layout
function showSection(sectionName) {
    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show hero section by default
    document.getElementById('hero').style.display = 'flex';
    
    // Show the requested section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.nav-link[onclick="showSection('${sectionName}')"]`)?.classList.add('active');
    }
}

// Legacy functions for backward compatibility
function showabout() { showSection('about'); }
function showwork() { showSection('work'); }
function showcontact() { showSection('contact'); }
function showblogs() { showSection('blogs'); }

// No-op close functions for backward compatibility
function closeabout() {}
function closework() {}
function closecontact() {}
function closeblogs() {}

async function showResume() {
    try {
        const generalData = await pbIndex.collection('general').getOne('mq08m3pb8cu9mfo', {
            fields: 'id,resume,collectionId',
            $cancelKey: 'resume-download-' + Date.now()
        });
        
        if (generalData?.resume) {
            const fileUrl = pbIndex.files.getUrl(generalData, generalData.resume);
            
            if (fileUrl) {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    window.location.href = fileUrl;
                } else {
                    window.open(fileUrl, '_blank');
                }
            } else {
                throw new Error('Invalid file URL');
            }
        } else {
            alert("Resume not found in general data");
        }
    } catch (error) {
        console.error('Resume fetch error:', error);
        if (error.status === 404) {
            alert("General data or resume not found");
        } else if (error.isAbort) {
            // Handle abort specifically
            alert("Request was cancelled. Please try again.");
        } else {
            alert("Error loading resume. Please try again later.");
            console.error(error);
        }
    }
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (mobileMenu.classList.contains('show')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    
    mobileMenu.classList.add('show');
    navToggle.classList.add('active');
    navbar.classList.add('mobile-menu-open');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    
    mobileMenu.classList.remove('show');
    navToggle.classList.remove('active');
    navbar.classList.remove('mobile-menu-open');
    document.body.style.overflow = '';
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (mobileMenu.classList.contains('show') && 
        !mobileMenu.contains(event.target) && 
        !navToggle.contains(event.target) && 
        !navbar.contains(event.target)) {
        closeMobileMenu();
    }
});

// Close mobile menu on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

if (window.location.hash === '#blogs') {
    setTimeout(function() {
        showblogs();
    }, 1000); 
}

if (window.location.hash === '#about') {
    setTimeout(function() {
        showabout();
    }, 1000); 
}

if (window.location.hash === '#work') {
    setTimeout(function() {
        showwork();
    }, 1000); 
}

if (window.location.hash === '#contact') {
    setTimeout(function() {
        showcontact();
    }, 1000); 
}

setTimeout(function(){
    const loading = document.getElementById("loading");
    if (loading) {
        loading.style.opacity = "0";
        setTimeout(function(){
            loading.style.display = "none";
        }, 500);
    }
}, 1500);
