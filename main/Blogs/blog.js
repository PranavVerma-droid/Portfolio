const ADMIN_IDS = [
  '4b404bw4707l2s2',
];

const pb = new PocketBase('https://pb-1.pranavv.co.in');

const app = Vue.createApp({
  data() {
    return {
      blog: null, 
      recentBlogs: [],
      isDarkMode: false,
      loading: false,
      error: null,
      isAuthenticated: false,
      currentUser: null,
      newComment: '',
      blogComments: [],
      commentUsers: new Map(),
      isLoggingIn: false,
      isAddingComment: false,
      loadingComments: false,
      currentPage: 1,
      commentsPerPage: 3,
      expandedComments: new Set(),
      commentPreviewLength: 200,
      sortBy: 'newest',
      showScrollTop: false,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.sortedComments.length / this.commentsPerPage);
    },

    sortedComments() {
      let filtered = [...this.blogComments];
      
      if (this.sortBy === 'admin') {
        filtered = filtered.filter(comment => 
          this.commentUsers.get(comment.userId) && 
          ADMIN_IDS.includes(comment.userId)
        );
      }

      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return this.sortBy === 'oldest' 
          ? dateA - dateB 
          : dateB - dateA;
      });
    },

    paginatedComments() {
      const start = (this.currentPage - 1) * this.commentsPerPage;
      const end = start + this.commentsPerPage;
      return this.sortedComments.slice(start, end);
    },

    showPagination() {
      return this.blogComments.length > this.commentsPerPage;
    }
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
    this.checkAuth();
    window.addEventListener('scroll', this.handleScroll);
  },

  methods: {
    async checkAuth() {
      this.isAuthenticated = pb.authStore.isValid;
      if (this.isAuthenticated) {
        this.currentUser = pb.authStore.model;
      }
    },

    async loginWithGoogle() {
      if (this.isLoggingIn) return;
      this.isLoggingIn = true;
      try {
        const authData = await pb.collection('users').authWithOAuth2({
          provider: 'google',
          scopes: ['profile', 'email'],
        });
        
        if (!authData.record.name || !authData.record.icon || !authData.record.blogComments) {
          const formData = new FormData();

          try {
            const avatarUrl = authData.meta.avatarUrl;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(avatarUrl)}`;
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            
            const reader = new FileReader();
            const base64Promise = new Promise(resolve => {
              reader.onloadend = () => resolve(reader.result);
            });
            reader.readAsDataURL(blob);
            const base64Data = await base64Promise;
            
            const imageBlob = await fetch(base64Data).then(r => r.blob());
            formData.append('icon', imageBlob, 'avatar.jpg');
          } catch (error) {
            console.error('Error fetching avatar:', error);
          }
          
          formData.append('name', authData.meta.name || 'Anonymous User');
          formData.append('blogComments', JSON.stringify([]));
          
          try {
            await pb.collection('users').update(authData.record.id, formData);
          } catch (updateError) {
            console.error('Error updating user:', updateError);
          }
        }
        
        this.isAuthenticated = true;
        this.currentUser = await pb.collection('users').getOne(authData.record.id);
        await this.loadComments();
      } catch (error) {
        console.error('OAuth error:', error);
      } finally {
        this.isLoggingIn = false;
      }
    },

    logout() {
      pb.authStore.clear();
      this.isAuthenticated = false;
      this.currentUser = null;
    },

    async loadComments() {
      if (!this.blog) return;
      this.loadingComments = true;
      try {
        const users = await pb.collection('users').getFullList({
          expand: 'icon'
        });
        
        this.blogComments = [];
        this.commentUsers.clear();

        for (const user of users) {
          this.commentUsers.set(user.id, user);
          
          let userComments = [];
          try {
            if (typeof user.blogComments === 'string') {
              userComments = JSON.parse(user.blogComments || '[]');
            } else if (Array.isArray(user.blogComments)) {
              userComments = user.blogComments;
            } else if (user.blogComments === null || user.blogComments === undefined) {
              userComments = [];
              await pb.collection('users').update(user.id, {
                blogComments: '[]'
              });
            } else {
              console.warn('Invalid blogComments format for user:', user.id);
              userComments = [];
              await pb.collection('users').update(user.id, {
                blogComments: '[]'
              });
            }
          } catch (e) {
            console.error('Error parsing blogComments for user:', user.id, e);
            await pb.collection('users').update(user.id, {
              blogComments: '[]'
            });
          }
          
          const blogComments = userComments.filter(c => c.blogId === this.blog.id);
          if (blogComments.length > 0) {
            this.blogComments.push(...blogComments.map(c => ({
              ...c,
              userId: user.id
            })));
          }
        }

        this.blogComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.blogComments = this.blogComments.map(comment => ({
          ...comment,
          isLoading: false,
          isSaving: false
        }));
        this.currentPage = 1;
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        this.loadingComments = false;
      }
    },

    async addComment() {
      if (!this.isAuthenticated || !this.newComment.trim() || this.isAddingComment) return;
      this.isAddingComment = true;
      try {
        const user = await pb.collection('users').getOne(this.currentUser.id);
        let comments = [];
        
        try {
          if (typeof user.blogComments === 'string') {
            comments = JSON.parse(user.blogComments || '[]');
          } else if (Array.isArray(user.blogComments)) {
            comments = user.blogComments;
          }
        } catch (parseError) {
          console.error('Error parsing existing blogComments:', parseError);
        }

        if (!Array.isArray(comments)) {
          comments = [];
        }
        
        comments.push({
          blogId: this.blog.id,
          content: this.newComment.trim(),
          createdAt: new Date().toISOString()
        });

        await pb.collection('users').update(this.currentUser.id, {
          blogComments: JSON.stringify(comments)
        });

        this.newComment = '';
        await this.loadComments();
      } catch (error) {
        console.error('Error adding comment:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      } finally {
        this.isAddingComment = false;
      }
    },

    getUserIcon() {
      if (!this.currentUser?.icon) return 'https://www.gravatar.com/avatar/0?d=mp';
      try {
        return pb.files.getURL(this.currentUser, this.currentUser.icon, {thumb: '100x100'});
      } catch (error) {
        console.error('Error getting user icon:', error);
        return 'https://www.gravatar.com/avatar/0?d=mp';
      }
    },

    getCommentUserIcon(userId) {
      const user = this.commentUsers.get(userId);
      if (!user?.icon) return 'https://www.gravatar.com/avatar/0?d=mp';
      try {
        return pb.files.getURL(user, user.icon, {thumb: '100x100'});
      } catch (error) {
        console.error('Error getting comment user icon:', error);
        return 'https://www.gravatar.com/avatar/0?d=mp';
      }
    },

    getCommentUserName(userId) {
      const user = this.commentUsers.get(userId);
      return user ? user.name : 'Unknown User';
    },

    async fetchBlog(blogId) {
      try {
        const record = await pb.collection('blogs').getOne(blogId, {
          expand: 'author'
        });
        if (record) {
          this.blog = record;
          this.updateMetadata(); // Add this line
          await this.loadComments();
          this.$nextTick(() => {
            document.querySelectorAll('pre').forEach(block => {
              block.classList.remove('line-numbers');
              if (!block.classList.contains('language-')) {
                const code = block.querySelector('code');
                if (code) {
                  code.classList.add('language-javascript');
                }
              }
            });
            Prism.highlightAll();
          });
        } else {
          alert("Blog not found.");
        }
      } catch (error) {
        console.error('Failed to fetch blog:', error);
        this.error = error.message;
      }
    },

    updateMetadata() {
      if (!this.blog) return;
      
      // Extract text content from HTML for description
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.blog.contentV2 || '';
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      const description = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
      
      // Update page title
      document.title = `${this.blog.title} - Pranav's Blog`;
      
      // Update meta description
      document.querySelector('meta[name="description"]').setAttribute('content', description);
      
      // Update Open Graph tags
      document.querySelector('meta[property="og:title"]').setAttribute('content', this.blog.title);
      document.querySelector('meta[property="og:description"]').setAttribute('content', description);
      document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
      
      // Update Twitter tags
      document.querySelector('meta[property="twitter:title"]').setAttribute('content', this.blog.title);
      document.querySelector('meta[property="twitter:description"]').setAttribute('content', description);
      document.querySelector('meta[property="twitter:url"]').setAttribute('content', window.location.href);
      
      // Update article tags
      if (this.blog.pubDateV2) {
        document.querySelector('meta[property="article:published_time"]').setAttribute('content', this.blog.pubDateV2);
      }
      
      // Update keywords if available
      if (this.blog.tags) {
        const keywords = Array.isArray(this.blog.tags) ? this.blog.tags.join(', ') : this.blog.tags;
        document.querySelector('meta[name="keywords"]').setAttribute('content', `blog, technology, programming, ${keywords}`);
      }
    },

    async fetchRecentBlogs(currentBlogId) {
      try {
        const resultList = await pb.collection('blogs').getList(1, 3, {
          sort: '-pubDateV2',
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
        const referrer = document.referrer;
        if (referrer.includes('blogs.pranavv.co.in') || 
            referrer.includes('pranavverma-droid.github.io/Portfolio/blogs') ||
            referrer.includes('127.0.0.1:5500/blogs')) {
            window.location.href = referrer;
        } else {
            window.location.href = "index.html#blogs";
        }
    },

    formatDate(dateString) {
      if (!dateString) {
      return 'Date not available';
      }
      
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

    formatDateTime(dateString) {
      if (!dateString) return 'Date not available';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Date format error';
      }
    },

    isUserAdmin(userId) {
      return ADMIN_IDS.includes(userId);
    },

    isCommentOwner(comment) {
      const isAdmin = this.currentUser && ADMIN_IDS.includes(this.currentUser.id);
      return this.isAuthenticated && (
        isAdmin || (this.currentUser && comment.userId === this.currentUser.id)
      );
    },

    startEditing(comment) {
      comment.isEditing = true;
      comment.editContent = comment.content;
    },

    cancelEdit(comment) {
      comment.isEditing = false;
      comment.editContent = comment.content;
    },

    async saveEdit(comment) {
      if (!comment.editContent.trim() || comment.isSaving) return;
      comment.isSaving = true;
      comment.isLoading = true;
      try {
        const user = await pb.collection('users').getOne(this.currentUser.id);
        let comments;
        
        try {
          comments = typeof user.blogComments === 'string' 
            ? JSON.parse(user.blogComments) 
            : Array.isArray(user.blogComments) 
              ? user.blogComments 
              : [];
        } catch (e) {
          console.error('Error parsing blogComments:', e);
          comments = [];
        }

        const commentIndex = comments.findIndex(c => 
          c.blogId === this.blog.id && 
          c.createdAt === comment.createdAt
        );

        if (commentIndex !== -1) {
          comments[commentIndex].content = comment.editContent.trim();
          
          await pb.collection('users').update(this.currentUser.id, {
            blogComments: JSON.stringify(comments)
          });

          comment.content = comment.editContent;
          comment.isEditing = false;
          await this.loadComments();
        }
      } catch (error) {
        console.error('Error editing comment:', error);
      } finally {
        comment.isSaving = false;
        comment.isLoading = false;
      }
    },

    async deleteComment(comment) {
      const isAdmin = this.currentUser && ADMIN_IDS.includes(this.currentUser.id);
      const confirmMessage = isAdmin 
        ? `Are you sure you want to delete this comment by user ${comment.userId}?`
        : 'Are you sure you want to delete this comment?';

      comment.isLoading = true;
      try {
        const userToUpdate = isAdmin && comment.userId !== this.currentUser.id
          ? await pb.collection('users').getOne(comment.userId)
          : await pb.collection('users').getOne(this.currentUser.id);
        
        let comments;
        
        try {
          comments = typeof userToUpdate.blogComments === 'string' 
            ? JSON.parse(userToUpdate.blogComments) 
            : Array.isArray(userToUpdate.blogComments) 
              ? userToUpdate.blogComments 
              : [];
        } catch (e) {
          console.error('Error parsing blogComments:', e);
          comments = [];
        }

        comments = comments.filter(c => 
          !(c.blogId === this.blog.id && c.createdAt === comment.createdAt)
        );

        await pb.collection('users').update(userToUpdate.id, {
          blogComments: JSON.stringify(comments)
        });

        await this.loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      } finally {
        comment.isLoading = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    initDarkMode() {
      const savedMode = localStorage.getItem('theme');
      // Default to dark mode
      if (savedMode === 'light') {
        this.isDarkMode = false;
        document.body.classList.add('light-mode');
      } else {
        this.isDarkMode = true;
        document.body.classList.remove('light-mode');
      }
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
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

    handleScroll() {
      this.showScrollTop = window.scrollY > 500;
      this.updateScrollProgress();
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },

    isCommentTruncated(content) {
      return content.length > this.commentPreviewLength;
    },

    getCommentPreview(content) {
      if (!this.isCommentTruncated(content)) return content;
      return this.expandedComments.has(content) 
        ? content 
        : content.substring(0, this.commentPreviewLength) + '...';
    },

    toggleComment(content) {
      if (this.expandedComments.has(content)) {
        this.expandedComments.delete(content);
      } else {
        this.expandedComments.add(content);
      }
    },

    getPreview(blog) {
      if (blog.isDevBlog) {
          return blog.introlog ? blog.introlog.substring(0, 100) + '...' : 'No preview available';
      } else {
          return blog.contentV2 ? blog.contentV2.substring(0, 100) + '...' : 'No preview available';
      }
    },

    // Social sharing methods
    shareOnTwitter() {
      if (!this.blog) return;
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this blog post: ${this.blog.title}`);
      const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&via=PranavVermaXD`;
      window.open(twitterUrl, '_blank');
    },

    shareOnLinkedIn() {
      if (!this.blog) return;
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(this.blog.title);
      const summary = encodeURIComponent(this.blog.contentV2 ? this.blog.contentV2.substring(0, 200).replace(/<[^>]*>/g, '') : 'Check out this blog post');
      const linkedinUrl = `https://www.linkedin.com/feed/update/urn:li:share/?text=${title}%20-%20${summary}%20${url}`;
      window.open(linkedinUrl, '_blank');
    },

    shareOnWhatsApp() {
      if (!this.blog) return;
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this blog post: ${this.blog.title} - ${url}`);
      const whatsappUrl = `https://wa.me/?text=${text}`;
      window.open(whatsappUrl, '_blank');
    },

    copyLink() {
      if (!this.blog) return;
      navigator.clipboard.writeText(window.location.href).then(() => {
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    },
  }
});

app.mount('#app');