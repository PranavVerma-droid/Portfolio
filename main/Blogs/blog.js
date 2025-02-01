const pb = new PocketBase('https://pb-1.pranavv.co.in');

const app = Vue.createApp({
  data() {
    return {
      blog: null, 
      recentBlogs: [],
      isDarkMode: false,
      loading: false,
      error: null
    };
  },

  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    if (blogId) {
      this.fetchBlog(blogId); 
      this.fetchRecentBlogs(blogId);
    }
    this.initDarkMode();
    this.initScrollProgress();
  },

  methods: {
    async fetchBlog(blogId) {
      try {
        const record = await pb.collection('blogs').getOne(blogId, {
          expand: 'author'
        });
        if (record) {
          this.blog = record;
        } else {
          alert("Blog not found.");
        }
      } catch (error) {
        console.error('Failed to fetch blog:', error);
        this.error = error.message;
      }
    },

    async fetchRecentBlogs(currentBlogId) {
      try {
        const resultList = await pb.collection('blogs').getList(1, 3, {
          sort: '-pubDate',
          filter: `id != "${currentBlogId}" && isDraft = false`
        });
        
        if (resultList && resultList.items) {
          this.recentBlogs = resultList.items;
        }
      } catch (error) {
        console.error("Error fetching recent blogs:", error);
        this.error = error.message;
      }
    },

    goBack() {
      window.location.href = "index.html#blogs";  
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },

    initDarkMode() {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode === 'true') {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
      }
      this.$nextTick(() => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', this.toggleDarkMode);
        } else {
          console.warn("Theme toggle button not found");
        }
      });
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', this.isDarkMode);
    },

    initScrollProgress() {
      window.addEventListener('scroll', this.updateScrollProgress);
      window.addEventListener('resize', this.updateScrollProgress);
      this.updateScrollProgress();
    },

    updateScrollProgress() {
      const scrollProgress = document.getElementById('scroll-progress-bar');
      if (scrollProgress) {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollPosition / documentHeight) * 100;
        scrollProgress.style.width = `${scrollPercentage}%`;
      }
    }
  }
});

app.mount('#app');