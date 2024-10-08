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

const firebaseConfig = {
  apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
  authDomain: "contactusform-f0ec2.firebaseapp.com",
  databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
  projectId: "contactusform-f0ec2",
  storageBucket: "contactusform-f0ec2.appspot.com",
  messagingSenderId: "641931730164",
  appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
  measurementId: "G-1RVB7HZQWB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const app = Vue.createApp({
  data() {
    return {
      blog: null, 
      recentBlogs: [],
      isDarkMode: false
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
        const blogDoc = await db.collection('blogs').doc(blogId).get();
        if (blogDoc.exists) {
          this.blog = blogDoc.data(); 
        } else {
          alert("Blog not found.");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to fetch blog.");
      }
    },
    async fetchRecentBlogs(currentBlogId) {
      try {
        const querySnapshot = await db.collection('blogs')
          .orderBy('publication_date', 'desc')
          .limit(3)
          .get();
        
        this.recentBlogs = querySnapshot.docs
          .filter(doc => doc.id !== currentBlogId && !doc.data().isDraft)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
      } catch (error) {
        console.error("Error fetching recent blogs:", error);
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
    },
  },
});

app.mount('#app');