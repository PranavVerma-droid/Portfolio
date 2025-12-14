/* 
    Copyright (C) 2024  Pranav Verma
    Licensed under GNU AGPL v3
*/

// ============================================
// Global State and Configuration
// ============================================
const pb = new PocketBase('https://pb-1.pranavv.co.in');
const GENERAL_DATA_ID = 'mq08m3pb8cu9mfo';

let generalData = null;
let allProjects = [];
let allPublications = [];
let allInternships = [];
let allCertificates = [];
let allBlogs = [];
let allDevBlogs = [];
let allSkills = [];
let allLanguages = [];
let allTools = [];
let allWorkshops = [];
let allCompetitions = [];
let allSocialWorks = [];

// ============================================
// Initialize on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initScrollEffects();
    initWorkTabs();
    
    // Load all data
    loadAllData();
});

// ============================================
// Load General Data (Profile, About, Resume)
// ============================================
async function loadGeneralData() {
    try {
        const record = await pb.collection('general').getOne(GENERAL_DATA_ID);
        generalData = record;
        
        // Update hero section
        if (record.tagline) {
            document.getElementById('heroTagline').textContent = record.tagline;
        }
        
        // Update about section
        if (record.about) {
            document.getElementById('aboutText').textContent = record.about;
        }
        
        // Update profile pictures
        if (record.profilePic) {
            const profileUrl = pb.files.getUrl(record, record.profilePic);
            const heroImg = document.getElementById('heroProfileImg');
            
            if (heroImg) {
                heroImg.src = profileUrl;
                heroImg.style.display = 'block';
            }
        }
        
        // Update resume link
        if (record.resume) {
            const resumeUrl = pb.files.getUrl(record, record.resume);
            const heroResumeLink = document.getElementById('heroResumeLink');
            if (heroResumeLink) {
                heroResumeLink.href = resumeUrl;
            }
        }
        
        // Update nav and footer with name (if available in future)
        const navName = document.getElementById('navLogoText');
        const footerName = document.getElementById('footerName');
        // Keep default for now, can be updated if name field is added
        
    } catch (error) {
        console.error('Failed to load general data:', error);
    }
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Scroll spy
    window.addEventListener('scroll', () => {
        // Add scrolled class to nav
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ============================================
// Theme Toggle
// ============================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    const sunIcon = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2224%22%20height=%2224%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20class=%22icon%20icon-tabler%20icons-tabler-outline%20icon-tabler-sun%22%3E%3Cpath%20stroke=%22none%22%20d=%22M0%200h24v24H0z%22%20fill=%22none%22/%3E%3Cpath%20d=%22M12%2012m-4%200a4%204%200%201%200%208%200a4%204%200%201%200%20-8%200%22%20/%3E%3Cpath%20d=%22M3%2012h1m8%20-9v1m8%208h1m-9%208v1m-6.4%20-15.4l.7%20.7m12.1%20-.7l-.7%20.7m0%2011.4l.7%20.7m-12.1%20-.7l-.7%20.7%22%20/%3E%3C/svg%3E";
    const moonIcon = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2224%22%20height=%2224%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20class=%22icon%20icon-tabler%20icons-tabler-outline%20icon-tabler-moon%22%3E%3Cpath%20stroke=%22none%22%20d=%22M0%200h24v24H0z%22%20fill=%22none%22/%3E%3Cpath%20d=%22M12%203c.132%200%20.263%200%20.393%200a7.5%207.5%200%200%200%207.92%2012.446a9%209%200%201%201%20-8.313%20-12.454z%22%20/%3E%3C/svg%3E";
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.src = moonIcon;
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeIcon.src = isLight ? moonIcon : sunIcon;
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ============================================
// Scroll Effects
// ============================================
function initScrollEffects() {
    const scrollTop = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });
    
    scrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Work Tabs
// ============================================
function initWorkTabs() {
    const workBtns = document.querySelectorAll('.work-nav-btn');
    const workSections = document.querySelectorAll('.work-section');
    const workSelect = document.getElementById('workNavSelect');
    
    // Handle button clicks
    workBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-work');
            
            workBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            workSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${target}-section`) {
                    section.classList.add('active');
                }
            });
            
            // Sync select dropdown
            if (workSelect) {
                workSelect.value = target;
            }
        });
    });
    
    // Handle select dropdown change
    if (workSelect) {
        workSelect.addEventListener('change', (e) => {
            const target = e.target.value;
            
            workBtns.forEach(b => {
                b.classList.remove('active');
                if (b.getAttribute('data-work') === target) {
                    b.classList.add('active');
                }
            });
            
            workSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${target}-section`) {
                    section.classList.add('active');
                }
            });
        });
    }
}

// ============================================
// Load All Data from PocketBase
// ============================================
async function loadAllData() {
    try {
        // Load all data in parallel (except blogs which need sequential loading)
        await Promise.all([
            loadGeneralData(),
            loadProjects(),
            loadPublications(),
            loadInternships(),
            loadCertificates(),
            loadWorkshops(),
            loadCompetitions(),
            loadSocialWorks(),
            loadSkills(),
            loadLanguages(),
            loadTools(),
            loadEducation()
        ]);
        
        // Load blogs sequentially to ensure proper merging
        await loadBlogs();
        await loadDevBlogs();
        
        // Render content after data is loaded
        renderInitialContent();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Load Projects
async function loadProjects() {
    try {
        const records = await pb.collection('projects').getFullList({
            sort: '-projectStartDate'
        });
        allProjects = records.map(project => {
            // Process project images
            if (project.projectImage) {
                if (!project.projectImage.startsWith('http')) {
                    project.projectImage = pb.files.getUrl(project, project.projectImage);
                }
            } else {
                project.projectImage = `https://via.placeholder.com/400x300?text=${encodeURIComponent(project.projectName)}`;
            }
            return project;
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

// Load Publications
async function loadPublications() {
    try {
        const records = await pb.collection('publications').getFullList({
            sort: '-publicationDate'
        });
        allPublications = records.map(pub => {
            if (pub.publicationImg && !pub.publicationImg.startsWith('http')) {
                pub.publicationImg = pb.files.getUrl(pub, pub.publicationImg);
            }
            return pub;
        });
    } catch (error) {
        console.error('Failed to load publications:', error);
    }
}

// Load Internships
async function loadInternships() {
    try {
        const records = await pb.collection('internships').getFullList({
            sort: '-internshipStartDate'
        });
        allInternships = records.map(intern => {
            if (intern.internshipImg && !intern.internshipImg.startsWith('http')) {
                intern.internshipImg = pb.files.getUrl(intern, intern.internshipImg);
            }
            return intern;
        });
    } catch (error) {
        console.error('Failed to load internships:', error);
    }
}

// Load Certificates
async function loadCertificates() {
    try {
        const records = await pb.collection('certificates').getFullList({
            sort: '-certificateIssueDate'
        });
        allCertificates = records.map(cert => {
            if (cert.certificateImg && !cert.certificateImg.startsWith('http')) {
                cert.certificateImg = pb.files.getUrl(cert, cert.certificateImg);
            }
            return cert;
        });
    } catch (error) {
        console.error('Failed to load certificates:', error);
    }
}

// Load Workshops
async function loadWorkshops() {
    try {
        const records = await pb.collection('workshops').getFullList({
            sort: '-workshopParticipationDate'
        });
        allWorkshops = records.map(workshop => {
            if (workshop.workshopImg && !workshop.workshopImg.startsWith('http')) {
                workshop.workshopImg = pb.files.getUrl(workshop, workshop.workshopImg);
            }
            return workshop;
        });
    } catch (error) {
        console.error('Failed to load workshops:', error);
    }
}

// Load Competitions
async function loadCompetitions() {
    try {
        const records = await pb.collection('competitions').getFullList({
            sort: '-competitionParticipationDate'
        });
        allCompetitions = records;
    } catch (error) {
        console.error('Failed to load competitions:', error);
    }
}

// Load Social Works
async function loadSocialWorks() {
    try {
        const records = await pb.collection('socialwork').getFullList({
            sort: '-socialWorkStartDate'
        });
        allSocialWorks = records.map(work => {
            if (work.socialWorkImg && !work.socialWorkImg.startsWith('http')) {
                work.socialWorkImg = pb.files.getUrl(work, work.socialWorkImg);
            }
            return work;
        });
    } catch (error) {
        console.error('Failed to load social works:', error);
    }
}

// Load Skills
async function loadSkills() {
    try {
        const records = await pb.collection('skills').getFullList();
        allSkills = records;
    } catch (error) {
        console.error('Failed to load skills:', error);
    }
}

// Load Languages
async function loadLanguages() {
    try {
        const records = await pb.collection('languages').getFullList({
            sort: '+languageName'
        });
        allLanguages = records.map(lang => {
            if (lang.languageImg && !lang.languageImg.startsWith('http')) {
                lang.languageImg = pb.files.getUrl(lang, lang.languageImg);
            }
            return lang;
        });
    } catch (error) {
        console.error('Failed to load languages:', error);
    }
}

// Load Tools
async function loadTools() {
    try {
        const records = await pb.collection('tools').getFullList({
            sort: '+class'
        });
        allTools = records.map(tool => {
            if (tool.toolImg && !tool.toolImg.startsWith('http')) {
                tool.toolImg = pb.files.getUrl(tool, tool.toolImg);
            }
            return tool;
        });
    } catch (error) {
        console.error('Failed to load tools:', error);
    }
}

// Load Education
async function loadEducation() {
    try {
        const records = await pb.collection('education').getFullList({
            sort: '-eduStartDate'
        });
        window.educationData = records.map(edu => {
            if (edu.eduLogo && !edu.eduLogo.startsWith('http')) {
                edu.eduLogo = pb.files.getUrl(edu, edu.eduLogo);
            }
            return edu;
        });
    } catch (error) {
        console.error('Failed to load education:', error);
    }
}

// Load Blogs
async function loadBlogs() {
    try {
        const records = await pb.collection('blogs').getFullList({
            sort: '-pubDateV2',
            filter: 'isDraft = false'
        });
        
        allBlogs = records.map(blog => ({
            ...blog,
            isDevBlog: false
        }));
    } catch (error) {
        console.error('Failed to load blogs:', error);
    }
}

// Load Dev Blogs
async function loadDevBlogs() {
    try {
        const records = await pb.collection('devBlogs').getFullList({
            sort: '-pubDate',
            filter: 'isDraft = false'
        });
        
        allDevBlogs = records.map(blog => ({
            ...blog,
            isDevBlog: true,
            pubDateV2: blog.pubDate, // Map pubDate to pubDateV2 for consistency
            category: blog.category || 'Updates' // Ensure category exists
        }));
        
        // Merge devBlogs into allBlogs array
        allBlogs = [...allBlogs, ...allDevBlogs].sort((a, b) => {
            const dateA = new Date(a.pubDateV2 || a.created);
            const dateB = new Date(b.pubDateV2 || b.created);
            return dateB - dateA; // Sort descending (newest first)
        });
    } catch (error) {
        console.error('Failed to load dev blogs:', error);
    }
}

// Load Socials
// NOTE: Social links are now handled by Vue app in links.js
// async function loadSocials() {
//     try {
//         const records = await pb.collection('socials').getFullList({
//             sort: '+socialName'
//         });
//         window.socialsData = records;
//         renderSocials();
//     } catch (error) {
//         console.error('Failed to load socials:', error);
//     }
// }

// ============================================
// Render Initial Content (Max 3 items)
// ============================================
function renderInitialContent() {
    renderProjects(6);
    renderPublications(3);
    renderInternships(3);
    renderCertificates(6);
    renderBlogs(3);
    renderEducation();
    renderTechStack();
    renderCoreSkills();
    // Social links are handled by Vue app in links.js
}

// ============================================
// Render Projects
// ============================================
function renderProjects(limit = null) {
    const container = document.getElementById('projectsGrid');
    const projects = limit ? allProjects.slice(0, limit) : allProjects;
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No projects available yet.</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" onclick="openProjectDetail('${project.id}')">
            <div class="project-image">
                <img src="${project.projectImage || 'https://via.placeholder.com/400x300?text=Project'}" 
                     alt="${project.projectName}"
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(project.projectName)}'">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.projectName}</h3>
                <p class="project-meta">${formatProjectDuration(project.projectStartDate, project.projectEndDate)}</p>
                <p class="project-description">${truncateText(project.projectDescription, 120)}</p>
                <div class="project-links">
                    ${project.projectAdditionalUrl1 ? `<a href="${project.projectAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                    ${project.projectAdditionalUrl2 ? `<a href="${project.projectAdditionalUrl2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                    ${project.projectAdditionalUrl3 ? `<a href="${project.projectAdditionalUrl3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                    ${project.projectAdditionalUrl4 ? `<a href="${project.projectAdditionalUrl4}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 4">🔗</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function openProjectDetail(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = project.projectName;
    modalBody.innerHTML = `
        <img src="${project.projectImage || 'https://via.placeholder.com/800x400'}" 
             alt="${project.projectName}" 
             style="max-width: 100%; height: auto; max-height: 350px; object-fit: contain; border-radius: 12px; margin-bottom: 2rem; display: block;">
        <p style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">
            ${formatDuration(project.projectStartDate, project.projectEndDate)}
        </p>
        <p style="color: var(--color-text-muted); margin-bottom: 1rem; font-size: 0.9rem;">
            Duration: ${formatProjectDuration(project.projectStartDate, project.projectEndDate)}
        </p>
        <p style="color: var(--color-text-primary); line-height: 1.8; margin-bottom: 2rem;">
            ${project.projectDescription}
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${project.projectAdditionalUrl1 ? `<a href="${project.projectAdditionalUrl1}" target="_blank" class="btn btn-primary">Link 1</a>` : ''}
            ${project.projectAdditionalUrl2 ? `<a href="${project.projectAdditionalUrl2}" target="_blank" class="btn btn-secondary">Link 2</a>` : ''}
            ${project.projectAdditionalUrl3 ? `<a href="${project.projectAdditionalUrl3}" target="_blank" class="btn btn-secondary">Link 3</a>` : ''}
            ${project.projectAdditionalUrl4 ? `<a href="${project.projectAdditionalUrl4}" target="_blank" class="btn btn-secondary">Link 4</a>` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// ============================================
// Render Publications
// ============================================
function renderPublications(limit = null) {
    const container = document.getElementById('publicationsList');
    const publications = limit ? allPublications.slice(0, limit) : allPublications;
    
    if (publications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">No publications available yet.</p>';
        return;
    }
    
    container.innerHTML = publications.map(pub => `
        <div class="publication-item" onclick="openPublicationDetail('${pub.id}')">
            ${pub.publicationImg ? `
                <img src="${pub.publicationImg}" alt="${pub.publicationName}" class="item-image">
            ` : ''}
            <div class="item-content">
                <h3>${pub.publicationName}</h3>
                <p class="item-subtitle">${pub.publicationJournal || 'Publication'}</p>
                <p class="item-meta">${formatDate(pub.publicationDate)}</p>
                <p class="item-description">${truncateText(pub.publicationDescription, 150)}</p>
                <div class="project-links" style="margin-top: var(--spacing-sm);">
                    ${pub.publicationLink1 ? `<a href="${pub.publicationLink1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                    ${pub.publicationLink2 ? `<a href="${pub.publicationLink2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                    ${pub.publicationLink3 ? `<a href="${pub.publicationLink3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                    ${pub.publicationLink4 ? `<a href="${pub.publicationLink4}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 4">🔗</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function openPublicationDetail(pubId) {
    const pub = allPublications.find(p => p.id === pubId);
    if (!pub) return;
    
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = pub.publicationName;
    modalBody.innerHTML = `
        ${pub.publicationImg ? `<img src="${pub.publicationImg}" alt="${pub.publicationName}" style="max-width: 100%; height: auto; max-height: 350px; object-fit: contain; border-radius: 12px; margin-bottom: 2rem; display: block;">` : ''}
        <p style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">
            <strong>${pub.publicationJournal || 'Publication'}</strong>
        </p>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
            Published: ${formatDate(pub.publicationDate)}
        </p>
        <p style="color: var(--color-text-primary); line-height: 1.8; margin-bottom: 2rem;">
            ${pub.publicationDescription}
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${pub.publicationLink1 ? `<a href="${pub.publicationLink1}" target="_blank" class="btn btn-primary">Read Paper</a>` : ''}
            ${pub.publicationLink2 ? `<a href="${pub.publicationLink2}" target="_blank" class="btn btn-secondary">Link 2</a>` : ''}
            ${pub.publicationLink3 ? `<a href="${pub.publicationLink3}" target="_blank" class="btn btn-secondary">Link 3</a>` : ''}
            ${pub.publicationLink4 ? `<a href="${pub.publicationLink4}" target="_blank" class="btn btn-secondary">Link 4</a>` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// ============================================
// Render Internships
// ============================================
function renderInternships(limit = null) {
    const container = document.getElementById('internshipsList');
    const internships = limit ? allInternships.slice(0, limit) : allInternships;
    
    if (internships.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">No internships available yet.</p>';
        return;
    }
    
    container.innerHTML = internships.map(intern => `
        <div class="experience-item" onclick="openInternshipDetail('${intern.id}')">
            ${intern.internshipImg ? `
                <img src="${intern.internshipImg}" alt="${intern.internshipName}" class="item-image">
            ` : ''}
            <div class="item-content">
                <h3>${intern.internshipName}</h3>
                <p class="item-subtitle">${intern.internshipInstituteName} ${intern.internshipType ? `• ${intern.internshipType}` : ''}</p>
                <p class="item-meta">${formatDuration(intern.internshipStartDate, intern.internshipEndDate)}</p>
                <p class="item-description">${truncateText(intern.internshipDescription, 150)}</p>
                <div class="project-links" style="margin-top: var(--spacing-sm);">
                    ${intern.internshipAdditionalUrl1 ? `<a href="${intern.internshipAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                    ${intern.internshipAdditionalUrl2 ? `<a href="${intern.internshipAdditionalUrl2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                    ${intern.internshipAdditionalUrl3 ? `<a href="${intern.internshipAdditionalUrl3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function openInternshipDetail(internId) {
    const intern = allInternships.find(i => i.id === internId);
    if (!intern) return;
    
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = intern.internshipName;
    modalBody.innerHTML = `
        ${intern.internshipImg ? `<img src="${intern.internshipImg}" alt="${intern.internshipName}" style="max-width: 100%; height: auto; max-height: 350px; object-fit: contain; border-radius: 12px; margin-bottom: 2rem; display: block;">` : ''}
        <p style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">
            <strong>${intern.internshipInstituteName}</strong> ${intern.internshipType ? `• ${intern.internshipType}` : ''}
        </p>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
            ${formatDuration(intern.internshipStartDate, intern.internshipEndDate)}
        </p>
        <p style="color: var(--color-text-primary); line-height: 1.8; margin-bottom: 2rem;">
            ${intern.internshipDescription}
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${intern.internshipAdditionalUrl1 ? `<a href="${intern.internshipAdditionalUrl1}" target="_blank" class="btn btn-primary">Link 1</a>` : ''}
            ${intern.internshipAdditionalUrl2 ? `<a href="${intern.internshipAdditionalUrl2}" target="_blank" class="btn btn-secondary">Link 2</a>` : ''}
            ${intern.internshipAdditionalUrl3 ? `<a href="${intern.internshipAdditionalUrl3}" target="_blank" class="btn btn-secondary">Link 3</a>` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// ============================================
// Render Certificates
// ============================================
function renderCertificates(limit = null) {
    const container = document.getElementById('certificatesGrid');
    const certificates = limit ? allCertificates.slice(0, limit) : allCertificates;
    
    if (certificates.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No certificates available yet.</p>';
        return;
    }
    
    container.innerHTML = certificates.map(cert => {
        const certImgUrl = cert.certificateImg || 'https://via.placeholder.com/400x300?text=Certificate';
        return `
        <div class="certificate-card" onclick="window.open('${cert.certificateUrl || cert.certificateImg}', '_blank')">
            <img src="${certImgUrl}" alt="${cert.certificateName}" class="certificate-image"
                 onerror="this.src='https://via.placeholder.com/400x300?text=Certificate'">
            <div class="certificate-content">
                <h4 class="certificate-title">${cert.certificateName}</h4>
                <p class="certificate-issuer">${cert.certificateIssue}</p>
                <p class="certificate-date">${formatDate(cert.certificateIssueDate)}</p>
                <div class="project-links" style="margin-top: var(--spacing-sm);">
                    ${cert.certificateUrl ? `<a href="${cert.certificateUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Certificate Link">🔗</a>` : ''}
                    ${cert.certificateAdditionalUrl1 ? `<a href="${cert.certificateAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

// ============================================
// Render Blogs
// ============================================
function renderBlogs(limit = null) {
    const featuredContainer = document.getElementById('featuredBlogs');
    const blogsContainer = document.getElementById('blogsGrid');
    const filtersContainer = document.getElementById('blogFilters');
    const filterSelect = document.getElementById('blogFilterSelect');
    
    if (allBlogs.length === 0) {
        blogsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No blog posts available yet.</p>';
        return;
    }
    
    // Get categories
    const categories = ['All', ...new Set(allBlogs.map(b => b.category).filter(Boolean))];
    
    // Render category filters (buttons)
    filtersContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'All' ? 'active' : ''}" 
                onclick="filterBlogs('${cat}')" 
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');
    
    // Populate select dropdown
    if (filterSelect) {
        filterSelect.innerHTML = categories.map(cat => `
            <option value="${cat}" ${cat === 'All' ? 'selected' : ''}>${cat === 'All' ? 'All Categories' : cat}</option>
        `).join('');
        
        // Add event listener for select
        filterSelect.addEventListener('change', (e) => {
            filterBlogs(e.target.value);
        });
    }
    
    // Render featured blogs (pinned)
    const featuredBlogs = allBlogs.filter(b => b.pinned);
    if (featuredBlogs.length > 0) {
        featuredContainer.innerHTML = featuredBlogs.slice(0, 1).map(blog => `
            <div class="blog-card featured" onclick="openBlogLink('${blog.id}', ${blog.isDevBlog})">
                <div class="blog-header">
                    <span class="blog-tag ${blog.isDevBlog ? 'dev' : ''}">${blog.isDevBlog ? 'Dev' : 'Blog'}</span>
                    <span class="blog-category">${blog.category || 'General'}</span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${truncateText(getExcerpt(blog), 200)}</p>
                <div class="blog-footer">
                    <span class="blog-date">${formatDate(blog.pubDateV2 || blog.created)}</span>
                    <span class="blog-read-more">Read More →</span>
                </div>
            </div>
        `).join('');
    }
    
    // Render regular blogs
    const regularBlogs = limit ? allBlogs.filter(b => !b.pinned).slice(0, limit) : allBlogs.filter(b => !b.pinned);
    if (regularBlogs.length > 0) {
        blogsContainer.innerHTML = regularBlogs.map(blog => `
            <div class="blog-card" onclick="openBlogLink('${blog.id}', ${blog.isDevBlog})">
                <div class="blog-header">
                    <span class="blog-tag ${blog.isDevBlog ? 'dev' : ''}">${blog.isDevBlog ? 'Dev' : 'Blog'}</span>
                    <span class="blog-category">${blog.category || 'General'}</span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${truncateText(getExcerpt(blog), 150)}</p>
                <div class="blog-footer">
                    <span class="blog-date">${formatDate(blog.pubDateV2 || blog.created)}</span>
                    <span class="blog-read-more">Read More →</span>
                </div>
            </div>
        `).join('');
    }
}

function filterBlogs(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Update select dropdown
    const blogSelect = document.getElementById('blogFilterSelect');
    if (blogSelect) {
        blogSelect.value = category;
    }
    
    // Re-render blogs
    const blogsContainer = document.getElementById('blogsGrid');
    const filteredBlogs = category === 'All' ? allBlogs.filter(b => !b.pinned) : allBlogs.filter(b => b.category === category && !b.pinned);
    
    if (filteredBlogs.length > 0) {
        blogsContainer.innerHTML = filteredBlogs.slice(0, 3).map(blog => `
            <div class="blog-card" onclick="openBlogLink('${blog.id}', ${blog.isDevBlog})">
                <div class="blog-header">
                    <span class="blog-tag ${blog.isDevBlog ? 'dev' : ''}">${blog.isDevBlog ? 'Dev' : 'Blog'}</span>
                    <span class="blog-category">${blog.category || 'General'}</span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${truncateText(getExcerpt(blog), 150)}</p>
                <div class="blog-footer">
                    <span class="blog-date">${formatDate(blog.pubDateV2 || blog.created)}</span>
                    <span class="blog-read-more">Read More →</span>
                </div>
            </div>
        `).join('');
    } else {
        blogsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No blogs in this category yet.</p>';
    }
}

function openBlogLink(blogId, isDevBlog) {
    const type = isDevBlog ? 'devblog' : 'blog';
    window.open(`${type}.html?id=${blogId}`, '_blank');
}

function getExcerpt(blog) {
    if (blog.excerpt) return blog.excerpt;
    
    // For dev blogs, use introlog as excerpt and strip HTML
    if (blog.isDevBlog && blog.introlog) {
        const temp = document.createElement('div');
        temp.innerHTML = blog.introlog;
        return temp.textContent || temp.innerText || '';
    }
    
    if (blog.contentV2) {
        // Strip HTML tags and get first 200 chars
        const temp = document.createElement('div');
        temp.innerHTML = blog.contentV2;
        return temp.textContent || temp.innerText || '';
    }
    if (blog.content) {
        const temp = document.createElement('div');
        temp.innerHTML = blog.content;
        return temp.textContent || temp.innerText || '';
    }
    return 'Click to read more...';
}

// ============================================
// Render Education
// ============================================
function renderEducation() {
    const container = document.getElementById('educationList');
    const viewMoreBtn = document.getElementById('viewMoreEducation');
    const education = window.educationData || [];
    const displayEducation = education.slice(0, 3); // Max 3
    
    if (displayEducation.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted);">No education information available.</p>';
        return;
    }
    
    container.innerHTML = displayEducation.map(edu => `
        <div class="education-item">
            ${edu.eduLogo ? `
                <img src="${edu.eduLogo}" alt="${edu.eduTitle}" class="education-logo">
            ` : ''}
            <div class="education-content">
                <h4 class="education-degree">${edu.eduTitle}</h4>
                <p class="education-description">${edu.eduDescription || ''}</p>
                <p class="education-duration">${formatDuration(edu.eduStartDate, edu.eduEndDate)}</p>
                ${(edu.eduLink1 || edu.eduLink2) ? `
                    <div class="education-links">
                        ${edu.eduLink1 ? `<a href="${edu.eduLink1}" target="_blank" class="education-link">Link 1 →</a>` : ''}
                        ${edu.eduLink2 ? `<a href="${edu.eduLink2}" target="_blank" class="education-link">Link 2 →</a>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Show View More button if there are more than 3 items
    if (viewMoreBtn && education.length > 3) {
        viewMoreBtn.style.display = 'inline-flex';
    }
}

// ============================================
// Render Tech Stack
// ============================================
function renderTechStack() {
    const container = document.getElementById('techStack');
    
    if (!allLanguages && !allTools) {
        container.innerHTML = '<p style="color: var(--color-text-muted);">No tech stack information available.</p>';
        return;
    }
    
    let html = '';
    
    // Languages section
    if (allLanguages && allLanguages.length > 0) {
        html += `
            <div class="tech-category">
                <h4>Languages</h4>
                <div class="tech-grid-small">
                    ${allLanguages.slice(0, 6).map(lang => `
                        <div class="tech-item" title="${lang.languageDescription || lang.languageName}">
                            ${lang.languageImg ? `<img src="${lang.languageImg}" alt="${lang.languageName}">` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Tools section
    if (allTools && allTools.length > 0) {
        html += `
            <div class="tech-category">
                <h4>Tools & Frameworks</h4>
                <div class="tech-grid-small">
                    ${allTools.slice(0, 6).map(tool => `
                        <div class="tech-item" title="${tool.toolDescription || tool.toolName}">
                            ${tool.toolImg ? `<img src="${tool.toolImg}" alt="${tool.toolName}">` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html || '<p style="color: var(--color-text-muted);">No tech stack information available.</p>';
}

// ============================================
// Render Core Skills
// ============================================
function renderCoreSkills() {
    const container = document.getElementById('coreSkillsList');
    const viewMoreBtn = document.getElementById('viewMoreSkills');
    
    if (!allSkills || allSkills.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted);">No core skills information available.</p>';
        return;
    }
    
    const displaySkills = allSkills.slice(0, 3); // Max 3
    
    container.innerHTML = displaySkills.map(skill => `
        <div class="skill-item" onclick="openSkillDetail('${skill.id}')" style="cursor: pointer;">
            <h4>${skill.skillName}</h4>
        </div>
    `).join('');
    
    // Show View More button if there are more than 3 items
    if (viewMoreBtn && allSkills.length > 3) {
        viewMoreBtn.style.display = 'inline-flex';
    }
}

// ============================================
// Render Socials
// ============================================
// NOTE: Social links are now handled by Vue app in links.js
// function renderSocials() {
//     const container = document.getElementById('socialGrid');
//     const socials = window.socialsData || [];
//     
//     if (socials.length === 0) {
//         container.innerHTML = '<p style="grid-column: 1/-1; color: var(--color-text-muted);">No social links available.</p>';
//         return;
//     }
//     
//     container.innerHTML = socials.map(social => `
//         <a href="${social.socialSource}" target="_blank" rel="noopener noreferrer" class="social-link">
//             ${social.socialIcon ? `<span style="font-size: 1.5rem;">${social.socialIcon}</span>` : ''}
//             <span>${social.socialName}</span>
//         </a>
//     `).join('');
// }

// ============================================
// Modal Functions - View All
// ============================================
function openProjectsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'All Projects';
    modalBody.innerHTML = `
        <div class="projects-grid">
            ${allProjects.map(project => `
                <div class="project-card" onclick="openProjectDetail('${project.id}');">
                    <div class="project-image">
                        <img src="${project.projectImage || 'https://via.placeholder.com/400x300'}" 
                             alt="${project.projectName}"
                             onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(project.projectName)}'">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.projectName}</h3>
                        <p class="project-meta">${formatProjectDuration(project.projectStartDate, project.projectEndDate)}</p>
                        <p class="project-description">${truncateText(project.projectDescription, 120)}</p>
                        <div class="project-links">
                            ${project.projectAdditionalUrl1 ? `<a href="${project.projectAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                            ${project.projectAdditionalUrl2 ? `<a href="${project.projectAdditionalUrl2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                            ${project.projectAdditionalUrl3 ? `<a href="${project.projectAdditionalUrl3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                            ${project.projectAdditionalUrl4 ? `<a href="${project.projectAdditionalUrl4}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 4">🔗</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openPublicationsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'All Publications';
    modalBody.innerHTML = `
        <div class="publications-list">
            ${allPublications.map(pub => `
                <div class="publication-item" onclick="openPublicationDetail('${pub.id}');">
                    ${pub.publicationImg ? `<img src="${pub.publicationImg}" alt="${pub.publicationName}" class="item-image">` : ''}
                    <div class="item-content">
                        <h3>${pub.publicationName}</h3>
                        <p class="item-subtitle">${pub.publicationJournal || 'Publication'}</p>
                        <p class="item-meta">${formatDate(pub.publicationDate)}</p>
                        <p class="item-description">${truncateText(pub.publicationDescription, 150)}</p>
                        <div class="project-links" style="margin-top: var(--spacing-sm);">
                            ${pub.publicationLink1 ? `<a href="${pub.publicationLink1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                            ${pub.publicationLink2 ? `<a href="${pub.publicationLink2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                            ${pub.publicationLink3 ? `<a href="${pub.publicationLink3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                            ${pub.publicationLink4 ? `<a href="${pub.publicationLink4}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 4">🔗</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openInternshipsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'All Internships';
    modalBody.innerHTML = `
        <div class="experience-list">
            ${allInternships.map(intern => `
                <div class="experience-item" onclick="openInternshipDetail('${intern.id}');">
                    ${intern.internshipImg ? `<img src="${intern.internshipImg}" alt="${intern.internshipName}" class="item-image">` : ''}
                    <div class="item-content">
                        <h3>${intern.internshipName}</h3>
                        <p class="item-subtitle">${intern.internshipInstituteName} ${intern.internshipType ? `• ${intern.internshipType}` : ''}</p>
                        <p class="item-meta">${formatDuration(intern.internshipStartDate, intern.internshipEndDate)}</p>
                        <p class="item-description">${truncateText(intern.internshipDescription, 150)}</p>
                        <div class="project-links" style="margin-top: var(--spacing-sm);">
                            ${intern.internshipAdditionalUrl1 ? `<a href="${intern.internshipAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                            ${intern.internshipAdditionalUrl2 ? `<a href="${intern.internshipAdditionalUrl2}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 2">🔗</a>` : ''}
                            ${intern.internshipAdditionalUrl3 ? `<a href="${intern.internshipAdditionalUrl3}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 3">🔗</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openCertificatesModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'All Certificates';
    modalBody.innerHTML = `
        <div class="certificates-grid">
            ${allCertificates.map(cert => `
                <div class="certificate-card" onclick="window.open('${cert.certificateUrl || cert.certificateImg}', '_blank')">
                    <img src="${cert.certificateImg || 'https://via.placeholder.com/400x300'}" 
                         alt="${cert.certificateName}" 
                         class="certificate-image"
                         onerror="this.src='https://via.placeholder.com/400x300?text=Certificate'">
                    <div class="certificate-content">
                        <h4 class="certificate-title">${cert.certificateName}</h4>
                        <p class="certificate-issuer">${cert.certificateIssue}</p>
                        <p class="certificate-date">${formatDate(cert.certificateIssueDate)}</p>
                        <div class="project-links" style="margin-top: var(--spacing-sm);">
                            ${cert.certificateUrl ? `<a href="${cert.certificateUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Certificate Link">🔗</a>` : ''}
                            ${cert.certificateAdditionalUrl1 ? `<a href="${cert.certificateAdditionalUrl1}" target="_blank" class="project-link" onclick="event.stopPropagation()" title="Link 1">🔗</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openBlogsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Show all blogs including devBlogs (both pinned and non-pinned)
    const displayBlogs = allBlogs.length > 0 ? allBlogs : [];
    
    modalTitle.textContent = 'All Blog Posts';
    modalBody.innerHTML = `
        <div class="blogs-grid">
            ${displayBlogs.map(blog => `
                <div class="blog-card" onclick="openBlogLink('${blog.id}', ${blog.isDevBlog})">
                    <div class="blog-header">
                        <span class="blog-tag ${blog.isDevBlog ? 'dev' : ''}">${blog.isDevBlog ? 'Dev' : 'Blog'}</span>
                        <span class="blog-category">${blog.category || 'General'}</span>
                    </div>
                    <h3 class="blog-title">${blog.title}</h3>
                    <p class="blog-excerpt">${truncateText(getExcerpt(blog), 150)}</p>
                    <div class="blog-footer">
                        <span class="blog-date">${formatDate(blog.pubDateV2 || blog.created)}</span>
                        <span class="blog-read-more">Read More →</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openEducationModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const education = window.educationData || [];
    
    modalTitle.textContent = 'All Education';
    modalBody.innerHTML = `
        <div class="education-list">
            ${education.map(edu => `
                <div class="education-item">
                    ${edu.eduLogo ? `
                        <img src="${edu.eduLogo}" alt="${edu.eduTitle}" class="education-logo">
                    ` : ''}
                    <div class="education-content">
                        <h4 class="education-degree">${edu.eduTitle}</h4>
                        <p class="education-description">${edu.eduDescription || ''}</p>
                        <p class="education-duration">${formatDuration(edu.eduStartDate, edu.eduEndDate)}</p>
                        ${(edu.eduLink1 || edu.eduLink2) ? `
                            <div class="education-links">
                                ${edu.eduLink1 ? `<a href="${edu.eduLink1}" target="_blank" class="education-link">Link 1 →</a>` : ''}
                                ${edu.eduLink2 ? `<a href="${edu.eduLink2}" target="_blank" class="education-link">Link 2 →</a>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openSkillDetail(skillId) {
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill) return;
    
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = skill.skillName;
    modalBody.innerHTML = `
        <div style="line-height: 1.8; font-size: 1rem; color: var(--color-text-secondary);">
            ${skill.skillDescription || '<p>No description available.</p>'}
        </div>
        ${skill.skillUrl ? `
            <div style="margin-top: 2rem;">
                <a href="${skill.skillUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Learn More →</a>
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

function openCoreSkillsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'All Core Skills';
    modalBody.innerHTML = `
        <div class="skills-list">
            ${allSkills.map(skill => `
                <div class="skill-item" onclick="openSkillDetail('${skill.id}')" style="cursor: pointer;">
                    <h4>${skill.skillName}</h4>
                    ${skill.skillDescription ? `<p>${truncateText(skill.skillDescription, 100)}</p>` : ''}
                    ${skill.skillUrl ? `
                        <div class="project-links" style="margin-top: var(--spacing-sm);">
                            <a href="${skill.skillUrl}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="event.stopPropagation()" title="Learn More">🔗</a>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function openSkillsModal() {
    const modal = document.getElementById('viewAllModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Complete Tech Stack';
    
    let html = '';
    
    // All Languages
    if (allLanguages && allLanguages.length > 0) {
        html += `
            <div style="margin-bottom: 3rem;">
                <h3 style="margin-bottom: 1.5rem; color: var(--color-text-primary);">Languages</h3>
                <div class="skills-list">
                    ${allLanguages.map(lang => `
                        <div class="skill-item" ${lang.languageSource ? `onclick="window.open('${lang.languageSource}', '_blank')"` : ''}>
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                ${lang.languageImg ? `<img src="${lang.languageImg}" alt="${lang.languageName}" style="width: 48px; height: 48px; object-fit: contain; flex-shrink: 0;">` : ''}
                                <div style="flex: 1;">
                                    <h4>${lang.languageName}</h4>
                                    ${lang.languageDescription ? `<p>${lang.languageDescription}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // All Tools
    if (allTools && allTools.length > 0) {
        html += `
            <div>
                <h3 style="margin-bottom: 1.5rem; color: var(--color-text-primary);">Tools & Frameworks</h3>
                <div class="skills-list">
                    ${allTools.map(tool => `
                        <div class="skill-item">
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                ${tool.toolImg ? `<img src="${tool.toolImg}" alt="${tool.toolName}" style="width: 48px; height: 48px; object-fit: contain; flex-shrink: 0;">` : ''}
                                <div style="flex: 1;">
                                    <h4>${tool.toolName}</h4>
                                    ${tool.toolDescription ? `<p>${tool.toolDescription}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = html || '<p style="color: var(--color-text-muted);">No tech stack information available.</p>';
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// ============================================
// Utility Functions
// ============================================
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDuration(startDate, endDate) {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!endDate) {
        return `${startFormatted} - Present`;
    }
    
    const end = new Date(endDate);
    const endFormatted = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    return `${startFormatted} - ${endFormatted}`;
}

function formatProjectDuration(startDate, endDate) {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
    
    if (monthDiff === 0) return 'Less than a month';
    if (monthDiff === 1) return '1 month';
    if (monthDiff < 12) return `${monthDiff} months`;
    
    const years = Math.floor(monthDiff / 12);
    const remainingMonths = monthDiff % 12;
    
    if (remainingMonths === 0) {
        return years === 1 ? '1 year' : `${years} years`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

// ============================================
// Window Functions (accessible globally)
// ============================================
window.openProjectDetail = openProjectDetail;
window.openPublicationDetail = openPublicationDetail;
window.openInternshipDetail = openInternshipDetail;
window.openProjectsModal = openProjectsModal;
window.openPublicationsModal = openPublicationsModal;
window.openInternshipsModal = openInternshipsModal;
window.openCertificatesModal = openCertificatesModal;
window.openBlogsModal = openBlogsModal;
window.openEducationModal = openEducationModal;
window.openCoreSkillsModal = openCoreSkillsModal;
window.openSkillsModal = openSkillsModal;
window.openSkillDetail = openSkillDetail;
window.openBlogLink = openBlogLink;
window.filterBlogs = filterBlogs;
window.closeModal = closeModal;
