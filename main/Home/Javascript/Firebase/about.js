const pbAbout = new PocketBase('https://pb-1.pranavv.co.in');

const appAbout = Vue.createApp({
  data() {
    return {
      user: null,
      tools: [],
      languages: [],
      skills: [],
      education: [],
      projects: [], // Add this
      skillUrl: "",
      aboutMe: ''
    };
  },

  computed: {
    totalTechnologies() {
      return this.languages.length + this.tools.length;
    }
  },

  mounted() {
    this.checkAuth();
    this.loadAll();
    
    // Animate counters after data is loaded
    setTimeout(() => {
      document.querySelectorAll('.stat-number[data-count]').forEach(element => {
        animateCounter(element);
      });
    }, 1000);
  },

  methods: {
    async checkAuth() {
      if (pbAbout.authStore.isValid) {
        this.user = pbAbout.authStore.model;
      }
    },

    async loadAll() {
      await Promise.all([
        this.loadTools(),
        this.loadLanguages(),
        this.loadSkills(),
        this.loadEducation(),
        this.loadAboutMe(),
        this.fetchProjects()
      ]);
    },

    async loadTools() {
      try {
        const records = await pbAbout.collection('tools').getFullList({
          sort: '+class'
        });
        this.tools = records;
      } catch (error) {
        console.error('Failed to load Tools:', error);
      }
    },

    async loadLanguages() {
      try {
        const languages = await pbAbout.collection('languages').getFullList({
          sort: '+languageName'
        });
        this.languages = languages;
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    },

    async loadAboutMe() {
      try {
        const userRecord = await pbAbout.collection('users').getOne('4b404bw4707l2s2', {
          fields: 'aboutMe'
        });
        
        const aboutMeElement = document.getElementById('about-me-text');
        if (userRecord?.aboutMe) {
          aboutMeElement.textContent = userRecord.aboutMe;
        } else {
          aboutMeElement.textContent = 'No about me information available.';
        }
      } catch (error) {
        console.error('Failed to load about me:', error);
      }
    },

    async loadSkills() {
      try {
        const records = await pbAbout.collection('skills').getFullList();
        this.skills = records;
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    },
    
    async loadEducation() {
      try {
        const records = await pbAbout.collection('education').getFullList({
          sort: '-eduStartDate'
        });
        this.education = records;
        
        this.$nextTick(() => {
          const counters = document.querySelectorAll('.stat-number[data-count]');
          counters.forEach(counter => {
            if (counter.textContent === '0') {
              animateCounter(counter);
            }
          });
        });
      } catch (error) {
        console.error('Failed to load education:', error);
        this.education = [];
      }
    },

    async fetchProjects() {
      try {
        const records = await pbAbout.collection('projects').getFullList({
          sort: '-projectStartDate',
        });
        this.projects = records;
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },

    formatEducationDuration(startDate, endDate) {
      // If both dates are empty, return empty string
      if (!startDate && !endDate) return '';
      
      // If only start date exists
      if (!startDate && endDate) {
        const endDateTime = new Date(endDate);
        const endMonth = endDateTime.toLocaleString('default', { month: 'long' });
        const endYear = endDateTime.getFullYear();
        return `Until ${endMonth} ${endYear}`;
      }
      
      // If only end date is missing (ongoing)
      if (startDate && !endDate) {
        const startDateTime = new Date(startDate);
        const startMonth = startDateTime.toLocaleString('default', { month: 'long' });
        const startYear = startDateTime.getFullYear();
        return `${startMonth} ${startYear} - Present`;
      }
      
      // Both dates exist
      const startDateTime = new Date(startDate);
      const startMonth = startDateTime.toLocaleString('default', { month: 'long' });
      const startYear = startDateTime.getFullYear();
      
      const endDateTime = new Date(endDate);
      const endMonth = endDateTime.toLocaleString('default', { month: 'long' });
      const endYear = endDateTime.getFullYear();
      
      const yearDiff = endDateTime.getFullYear() - startDateTime.getFullYear();
      const monthDiff = endDateTime.getMonth() - startDateTime.getMonth();
      
      // Calculate total months and then convert to years and remaining months
      const totalMonths = yearDiff * 12 + monthDiff;
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      
      let durationText = '';
      if (years > 0) {
        durationText += `${years} Year${years > 1 ? 's' : ''}`;
        if (months > 0) {
          durationText += `, ${months} Month${months > 1 ? 's' : ''}`;
        }
      } else if (months > 0) {
        durationText += `${months} Month${months > 1 ? 's' : ''}`;
      } else {
        durationText += 'Less than a month';
      }
      
      return `${startMonth} ${startYear} - ${endMonth} ${endYear} (${durationText})`;
    },

    visitLink(link) {
      window.open(link, '_blank');
    },

    openSkillModal(skill) {
      const modal = document.getElementById('detailModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');
      
      modalTitle.textContent = skill.skillName;
      modalBody.innerHTML = `
        <p>${skill.skillDescription}</p>
        ${skill.skillUrl ? `<div class="skill-links"><a href="${skill.skillUrl}" target="_blank" class="btn btn-primary">Learn More <i class="fas fa-arrow-right"></i></a></div>` : ''}
      `;
      
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    },

    openTechModal(type) {
      const modal = document.getElementById('detailModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');
      
      if (type === 'languages') {
        modalTitle.textContent = 'All Programming Languages';
        const languagesGrid = this.languages.map(language => `
          <div class="tech-item" onclick="window.open('${language.languageSource}', '_blank')" style="cursor: pointer;" title="Click to view ${language.languageName} source">
            <img src="${language.languageImg}" alt="${language.languageName}">
            <span>${language.languageName}</span>
          </div>
        `).join('');
        
        modalBody.innerHTML = `
          <div class="tech-grid">${languagesGrid}</div>
        `;
      } else if (type === 'tools') {
        modalTitle.textContent = 'All Development Tools';
        const toolsGrid = this.tools.map(tool => `
          <div class="tech-item">
            <img src="${tool.toolImg}" alt="${tool.toolName}">
            <span>${tool.toolName}</span>
          </div>
        `).join('');
        
        modalBody.innerHTML = `
          <div class="tech-grid">${toolsGrid}</div>
        `;
      }
      
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }
});

// Modal functions
function closeModal() {
  const modal = document.getElementById('detailModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('detailModal');
  if (event.target === modal) {
    closeModal();
  }
}

appAbout.mount('#about');