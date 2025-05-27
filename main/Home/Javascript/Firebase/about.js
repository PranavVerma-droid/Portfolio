const pbAbout = new PocketBase('https://pb-1.pranavv.co.in');

const appAbout = Vue.createApp({
  data() {
    return {
      user: null,
      tools: [],
      languages: [],
      skills: [],
      education: [],
      skillUrl: "",
      aboutMe: ''
    };
  },

  mounted() {
    this.checkAuth();
    this.loadAll();
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
        this.loadAboutMe()
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
        
        const aboutMePlaceholder = document.getElementById('about-me-placeholder');
        if (userRecord?.aboutMe) {
          aboutMePlaceholder.textContent = userRecord.aboutMe;
        } else {
          aboutMePlaceholder.textContent = 'No about me information available.';
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
        const records = await pbAbout.collection('education').getFullList();
        this.education = records;
      } catch (error) {
        console.error('Failed to load education:', error);
      }
    },

    formatEducationDuration(startDate, endDate) {
      if (!startDate) return '';
      
      const startDateTime = new Date(startDate);
      const startMonth = startDateTime.toLocaleString('default', { month: 'long' });
      const startYear = startDateTime.getFullYear();
      
      // If no end date, just return the start date
      if (!endDate) {
        return `${startMonth} ${startYear}`;
      }
      
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
    }
  }
});

appAbout.mount('#about_container');