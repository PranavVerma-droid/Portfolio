const pbBlogs = new PocketBase('https://pb-1.pranavv.co.in');

const appBlogs = Vue.createApp({
  data() {
    return {
      blogs: [],
      pinnedBlogs: [],
      loading: false,
      error: null,
      categories: ['All'],
      selectedCategory: 'All'
    };
  },

  mounted() {
    this.fetchAllBlogs();
  },

  computed: {
    filteredBlogs() {
      if (this.selectedCategory === 'All') {
        return this.blogs;
      }
      return this.blogs.filter(blog => blog.category === this.selectedCategory);
    }
  },

  methods: {
    async fetchAllBlogs() {
      this.loading = true;
      try {
        // Fetch both regular blogs and dev blogs
        const [regularBlogs, devBlogs] = await Promise.all([
          pbBlogs.collection('blogs').getList(1, 100, {
            sort: '-pubDateV2',
            filter: 'isDraft = false'
          }),
          pbBlogs.collection('devBlogs').getList(1, 100, {
            sort: '-pubDate'
          })
        ]);

        // Combine and process regular blogs
        const processedRegularBlogs = regularBlogs.items.map(blog => ({
          ...blog,
          isDevBlog: false
        }));

        // Combine and process dev blogs
        const processedDevBlogs = devBlogs.items.map(blog => ({
          ...blog,
          isDevBlog: true
        }));

        // Combine all blogs
        const allBlogs = [...processedRegularBlogs, ...processedDevBlogs];

        // Sort by date
        allBlogs.sort((a, b) => {
          const dateA = this.getLatestDate(a);
          const dateB = this.getLatestDate(b);
          return new Date(dateB) - new Date(dateA);
        });

        // Split into pinned and regular
        this.pinnedBlogs = allBlogs.filter(blog => blog.pinned);
        this.blogs = allBlogs;

        // Collect all unique categories
        const categorySet = new Set(['All']);
        allBlogs.forEach(blog => {
          if (blog.category) categorySet.add(blog.category);
        });
        this.categories = Array.from(categorySet);

      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    getLatestDate(blog) {
      if (blog.isDevBlog) {
        const logDates = [];
        const properties = Object.keys(blog);
        const logDateEntries = properties.filter(prop => /^log\d+date$/.test(prop));
        
        logDateEntries.forEach(dateKey => {
          if (blog[dateKey]) {
            logDates.push(new Date(blog[dateKey]));
          }
        });
        
        if (blog.pubDate) {
          logDates.push(new Date(blog.pubDate));
        }
        
        return logDates.length > 0 
          ? new Date(Math.max(...logDates)).toISOString()
          : blog.pubDate;
      }
      
      return blog.pubDateV2 || blog.pubDate;
    },

    formatDate(dateString) {
      if (!dateString) return 'Date not available';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Date format error';
      }
    },

    selectCategory(category) {
      this.selectedCategory = category;
    }
  }
});

appBlogs.mount('#blogs_container_mount');