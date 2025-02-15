const pbBlogs = new PocketBase('https://pb-1.pranavv.co.in');

const appBlogs = Vue.createApp({
  data() {
    return {
      user: null,
      title: "",
      content: "",
      pinnedBlogs: [],
      blogs: [],
      draftBlogs: [],
      blogIdToEdit: null,
      isDraft: false,
      loading: false,
      error: null
    };
  },

  mounted() {
    // this.checkAuth();
    this.fetchBlogs();
  },

  methods: {
    async fetchBlogs() {
      this.loading = true;
      try {
        const result = await pbBlogs.collection('blogs').getList(1, 100, {
          sort: '-pubDateV2'
        });
    
        if (result && result.items) {
          this.blogs = result.items.filter(record => !record.isDraft);
          this.draftBlogs = result.items.filter(record => record.isDraft);
          this.pinnedBlogs = result.items.filter(record => record.pinned);
    
          const sortByDate = (a, b) => {
            const dateA = a.pubDateV2 || a.created;
            const dateB = b.pubDateV2 || b.created;
            return new Date(dateB) - new Date(dateA);
          };
          
          this.blogs.sort(sortByDate);
          this.draftBlogs.sort(sortByDate);
          this.pinnedBlogs.sort(sortByDate);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    /*
    async checkAuth() {
      if (pbBlogs.authStore.isValid) {
        this.user = pbBlogs.authStore.model;
      }
    },

    async loginWithGoogle() {
      try {
        const authData = await pbBlogs.collection('users').authWithOAuth2({ 
          provider: 'google' 
        });
        this.user = authData.record;
        this.fetchBlogs();
      } catch (error) {
        console.error(error);
        alert("Google Sign-In failed. Please try again.");
      }
    },

    async signOut() {
      pbBlogs.authStore.clear();
      this.user = null;
    },

    async submitBlog() {
      try {
        const data = {
          title: this.title,
          content: this.content,
          author: this.user?.email || "Anonymous",
          isDraft: this.isDraft,
          pinned: false,
          pubDate: new Date().toISOString()
        };

        if (this.blogIdToEdit) {
          await pbBlogs.collection('blogs').update(this.blogIdToEdit, data);
        } else {
          await pbBlogs.collection('blogs').create(data);
        }
        
        this.resetForm();
        alert("Blog Added / Updated Successfully!");
        await this.fetchBlogs();
      } catch (error) {
        console.error('Failed to save blog:', error);
        this.error = error.message;
      }
    },

    async deleteBlog(blogId) {
      if (confirm("Are you sure you want to delete this blog?")) {
        try {
          await pbBlogs.collection('blogs').delete(blogId);
          await this.fetchBlogs();
        } catch (error) {
          console.error('Failed to delete blog:', error);
        }
      }
    },

    async publishBlog(blogId) {
      try {
        await pbBlogs.collection('blogs').update(blogId, {
          isDraft: false
        });
        await this.fetchBlogs();
        alert("Blog published successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to publish blog.");
      }
    },

    async togglePin(blogId, currentPinned) {
      try {
        await pbBlogs.collection('blogs').update(blogId, {
          pinned: !currentPinned
        });
        await this.fetchBlogs();
      } catch (error) {
        console.error('Failed to toggle pin:', error);
      }
    },

    editBlog(blog) {
      this.title = blog.title;
      this.content = blog.content;
      this.blogIdToEdit = blog.id;
      this.isDraft = blog.isDraft;
    },

    resetForm() {
      this.title = "";
      this.content = "";
      this.isDraft = false;
      this.blogIdToEdit = null;
      this.fetchBlogs();
    }, */

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


    /*
    insertAtCursor(myField, myValue) {
      if (document.selection) {
        myField.focus();
        var sel = document.selection.createRange();
        sel.text = myValue;
      } else if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
      } else {
        myField.value += myValue;
      }
    },

    insertPStart() { this.insertAtCursor(this.$refs.content, '<p>'); },
    insertPEnd() { this.insertAtCursor(this.$refs.content, '</p>'); },
    insertBStart() { this.insertAtCursor(this.$refs.content, '<b>'); },
    insertBEnd() { this.insertAtCursor(this.$refs.content, '</b>'); },
    insertNextLine() { this.insertAtCursor(this.$refs.content, '<br>'); },
    insertAStart() { this.insertAtCursor(this.$refs.content, '<a href="" target="_blank">'); },
    insertAEnd() { this.insertAtCursor(this.$refs.content, '</a>'); },
    insertCodeStart() { this.insertAtCursor(this.$refs.content, '<pre><code>'); },
    insertCodeEnd() { this.insertAtCursor(this.$refs.content, '</code></pre>'); },
    insertImage() { this.insertAtCursor(this.$refs.content, '<img src=""><br>'); },
    insertWorkInProgress() {
      this.insertAtCursor(this.$refs.content, '<span style="color:red">Blog still a Work in Progress! More updates coming as the journey continues...</span>');
    }
    */
  }
});

appBlogs.mount('#blogs_container');