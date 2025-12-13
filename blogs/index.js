const pbBlogs = new PocketBase('https://pb-1.pranavv.co.in');
const CACHE_KEY = 'mcgXt7nZhgPJYjckcQJ0XOgqCcRiGNIS';
const CACHE_DURATION = 2 * 60 * 1000; // 2 mins

try {
    const appBlogs = Vue.createApp({
        data() {
            return {
                blogs: [],
                pinnedBlogs: [],
                loading: false,
                error: null,
                categories: ['All'],
                selectedCategory: 'All',
                page: 1,
                perPage: 10,
                hasMore: true,
                isDarkMode: localStorage.getItem('theme') !== 'light', // Default to dark unless explicitly light
                categoryColors: {
                    'Technology': '#4a9eff',
                    'Programming': '#2ecc71',
                    'Web Development': '#9b59b6',
                    'Design': '#e74c3c',
                    'Tutorial': '#f1c40f',
                    'Career': '#1abc9c',
                    'Personal': '#e67e22'
                }
            };
        },

        mounted() {
            if (!localStorage.getItem('theme')) {
                localStorage.setItem('theme', 'dark');
            }
            this.isDarkMode = localStorage.getItem('theme') !== 'light';
            this.loadFromCache();
            this.fetchAllBlogs();
            this.applyTheme();
            
            const scrollIndicator = document.querySelector('.scroll-indicator');
            let isIndicatorVisible = true;
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100 && isIndicatorVisible) {
                    scrollIndicator.classList.add('hidden');
                    isIndicatorVisible = false;
                } else if (window.scrollY <= 100 && !isIndicatorVisible) {
                    scrollIndicator.classList.remove('hidden');
                    isIndicatorVisible = true;
                }
            });
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
            loadFromCache() {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        this.blogs = data.blogs;
                        this.pinnedBlogs = data.pinnedBlogs;
                        this.categories = data.categories;
                        return true;
                    }
                }
                return false;
            },

            saveToCache(data) {
                const cacheData = {
                    data,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            },

            async fetchAllBlogs() {
                if (this.loading || (!this.hasMore && this.blogs.length > 0)) return;
                
                this.loading = true;
                try {
                    const [regularBlogs, devBlogs] = await Promise.all([
                        pbBlogs.collection('blogs').getList(this.page, this.perPage, {
                            sort: '-pubDateV2',
                            filter: 'isDraft = false'
                        }),
                        pbBlogs.collection('devBlogs').getList(this.page, this.perPage, {
                            sort: '-pubDate'
                        })
                    ]);

                    const processedRegularBlogs = regularBlogs.items.map(blog => ({
                        ...blog,
                        isDevBlog: false
                    }));

                    const processedDevBlogs = devBlogs.items.map(blog => ({
                        ...blog,
                        isDevBlog: true
                    }));

                    const newBlogs = [...processedRegularBlogs, ...processedDevBlogs].sort((a, b) => {
                        const dateA = this.getLatestDate(a);
                        const dateB = this.getLatestDate(b);
                        return new Date(dateB) - new Date(dateA);
                    });

                    if (this.page === 1) {
                        this.pinnedBlogs = newBlogs.filter(blog => blog.pinned);
                        this.blogs = newBlogs.filter(blog => !blog.pinned);
                    } else {
                        this.blogs = [...this.blogs, ...newBlogs.filter(blog => !blog.pinned)];
                    }

                    const categorySet = new Set(['All']);
                    this.blogs.forEach(blog => {
                        if (blog.category) categorySet.add(blog.category);
                    });
                    this.categories = Array.from(categorySet);

                    this.hasMore = regularBlogs.totalPages > this.page || devBlogs.totalPages > this.page;
                    
                    if (this.page === 1) {
                        this.saveToCache({
                            blogs: this.blogs,
                            pinnedBlogs: this.pinnedBlogs,
                            categories: this.categories
                        });
                    }

                    this.page++;
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

            selectCategory(event) {
                if (typeof event === 'object' && event.target) {
                    this.selectedCategory = event.target.value;
                } else {
                    this.selectedCategory = event;
                }
                this.page = 1;
                this.blogs = [];
                this.hasMore = true;
                this.fetchAllBlogs();
            },

            navigateToBlog(blog) {
                const baseUrl = 'https://pranavv.co.in/';
                const url = blog.isDevBlog 
                    ? `${baseUrl}devblog.html?id=${blog.id}`
                    : `${baseUrl}blog.html?id=${blog.id}`;
                window.location.href = url;
            },

            toggleTheme() {
                this.isDarkMode = !this.isDarkMode;
                localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
                this.applyTheme();
            },

            applyTheme() {
                if (this.isDarkMode) {
                    document.body.classList.remove('light-mode');
                } else {
                    document.body.classList.add('light-mode');
                }
                document.body.dispatchEvent(new CustomEvent('themeChange', {
                    detail: { isDark: this.isDarkMode }
                }));
            },

            calculateReadingTime(text) {
                const wordsPerMinute = 200;
                const words = text?.split(/\s+/)?.length || 0;
                return Math.max(1, Math.ceil(words / wordsPerMinute));
            },

            getCategoryStyle(category) {
                const color = this.categoryColors[category] || '#4a9eff';
                return {
                    background: color,
                    boxShadow: `0 2px 10px ${color}40`
                };
            }
        }
    });

    appBlogs.mount('#blogs_container_mount');
} catch (error) {
    console.error('Vue initialization failed:', error);
    document.getElementById('blogs_container_mount').innerHTML = 
        '<div style="text-align: center; padding: 20px;">Failed to load blog components. Please refresh the page.</div>';
}
