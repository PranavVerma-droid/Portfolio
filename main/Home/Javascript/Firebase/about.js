const pbAbout = new PocketBase('https://db.pranavv.co.in');

const appAbout = Vue.createApp({
  data() {
    return {
      user: null,
      tools: [],
      languages: [],
      skills: [],
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
        const userRecord = await pbAbout.collection('users').getOne('99mg77734m8732h', {
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

    visitLink(link) {
      window.open(link, '_blank');
    }
  }
});

appAbout.mount('#about_container');