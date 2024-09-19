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

const firebaseConfigBlogs = {
  apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
  authDomain: "contactusform-f0ec2.firebaseapp.com",
  databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
  projectId: "contactusform-f0ec2",
  storageBucket: "contactusform-f0ec2.appspot.com",
  messagingSenderId: "641931730164",
  appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
  measurementId: "G-1RVB7HZQWB"
};

firebase.initializeApp(firebaseConfigBlogs);

const dbBlogs = firebase.firestore();

const appBlogs = Vue.createApp({
  data() {
    return {
      user: null,
      title: "",
      content: "",
      pinnedBlogs: [],
      allBlogs: [],
      blogs: [],
      draftBlogs: [], 
      blogIdToEdit: null,
      isDraft: false, 
    };
  },
  mounted() {
    this.fetchBlogs();
    firebase.auth().onAuthStateChanged(user => {
      this.user = user;
      this.fetchBlogs();
    });
  },
  methods: {
    loginWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then(result => {
          this.user = result.user;
        })
        .catch(error => {
          console.error(error);
          alert("Google Sign-In failed. Please try again. (Check Console for Errors OR Sign in with a Root Account.)");
        });
    },
    submitBlog() {
      const blogData = {
        title: this.title,
        content: this.content,
        author: this.user ? this.user.email : "Anonymous",
        publication_date: new Date().toISOString(),
        isDraft: this.isDraft, 
      };

      if (this.blogIdToEdit) {
        dbBlogs.collection("blogs").doc(this.blogIdToEdit).update(blogData)
          .then(() => {
            this.resetForm();
            alert("Blog updated successfully!");
          })
          .catch(error => {
            console.error(error);
            alert("Failed to update blog.");
          });
      } else {
        dbBlogs.collection("blogs").add(blogData)
          .then(() => {
            this.resetForm();
            alert("Blog submitted successfully!");
          })
          .catch(error => {
            console.error(error);
            alert("Failed to submit blog.");
          });
      }
    },
    signOut() {
      firebase.auth().signOut()
        .then(() => {
          this.user = null;
        })
        .catch(error => {
          console.error(error);
          alert("Sign out failed.");
        });
    },
    async fetchBlogs() {
      try {
        const querySnapshot = await dbBlogs.collection("blogs").orderBy("publication_date", "desc").get();
        this.blogs = querySnapshot.docs
          .filter(doc => !doc.data().isDraft) 
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        this.draftBlogs = querySnapshot.docs
          .filter(doc => doc.data().isDraft) 
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        this.pinnedBlogs = this.blogs.filter(blog => blog.pinned);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch blogs.");
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },
    editBlog(blog) {
      this.title = blog.title;
      this.content = blog.content;
      this.blogIdToEdit = blog.id;
      this.isDraft = blog.isDraft; 
    },
    deleteBlog(blogId) {
      const confirmation = confirm("Are you sure you want to delete this blog?");
      if (confirmation) {
        dbBlogs.collection("blogs").doc(blogId).delete()
          .then(() => {
            this.fetchBlogs();
            alert("Blog deleted successfully!");
          })
          .catch(error => {
            console.error(error);
            alert("Failed to delete blog.");
          });
      }
    },
    publishBlog(blogId) {
      dbBlogs.collection("blogs").doc(blogId).update({
        isDraft: false 
      })
      .then(() => {
        this.fetchBlogs();
        alert("Blog published successfully!");
      })
      .catch(error => {
        console.error(error);
        alert("Failed to publish blog.");
      });
    },
    resetForm() {
      this.title = "";
      this.content = "";
      this.isDraft = false; 
      this.blogIdToEdit = null;
      this.fetchBlogs();
    },
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
    insertPStart() {
      this.insertAtCursor(this.$refs.content, '<p>');
    },
    insertPEnd() {
      this.insertAtCursor(this.$refs.content, '</p>');
    },
    insertBStart() {
      this.insertAtCursor(this.$refs.content, '<b>');
    },
    insertBEnd() {
      this.insertAtCursor(this.$refs.content, '</b>');
    },
    insertNextLine() {
      this.insertAtCursor(this.$refs.content, '<br>');
    },
    insertAStart() {
      this.insertAtCursor(this.$refs.content, '<a href="" target="_blank">');
    },
    insertAEnd() {
      this.insertAtCursor(this.$refs.content, '</a>');
    },
    insertCodeStart() {
      this.insertAtCursor(this.$refs.content, '<pre><code>');
    },
    insertCodeEnd() {
      this.insertAtCursor(this.$refs.content, '</code></pre>');
    },
    insertImage() {
      this.insertAtCursor(this.$refs.content, '<img src=""><br>');
    }
  }
});

appBlogs.mount('#blogs_container_mount');
