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
        const userRecord = await pbIndex.collection('users').getOne('4b404bw4707l2s2', {
            fields: 'id,resume,collectionId',
            $cancelKey: 'resume-download-' + Date.now()
        });
        
        if (userRecord?.resume) {
            const fileUrl = pbIndex.files.getUrl(userRecord, userRecord.resume);
            
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
            alert("Resume not found in user profile");
        }
    } catch (error) {
        console.error('Resume fetch error:', error);
        if (error.status === 404) {
            alert("User profile or resume not found");
        } else if (error.isAbort) {
            // Handle abort specifically
            alert("Request was cancelled. Please try again.");
        } else {
            alert("Error loading resume. Please try again later.");
            console.error(error);
        }
    }
}

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
