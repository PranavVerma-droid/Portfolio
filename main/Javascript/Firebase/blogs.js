const firebaseConfig4 = {
  apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
  authDomain: "contactusform-f0ec2.firebaseapp.com",
  databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
  projectId: "contactusform-f0ec2",
  storageBucket: "contactusform-f0ec2.appspot.com",
  messagingSenderId: "641931730164",
  appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
  measurementId: "G-1RVB7HZQWB"
};

firebase.initializeApp(firebaseConfig4);

const db4 = firebase.firestore();

const app4 = Vue.createApp({
  data() {
    return {
      user: null,
      title: "",
      content: "",
      blogs: [],
      blogIdToEdit: null
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
          this.loadProjects();
          this.loadAboutMe();
        })
        .catch(error => {
          console.error(error);
          alert("Google Sign-In failed. Please try again.");
        });
    },
    submitBlog() {
      if (this.blogIdToEdit) {
        // Edit existing blog
        db4.collection("blogs").doc(this.blogIdToEdit).update({
          title: this.title,
          content: this.content,
        })
          .then(() => {
            this.title = "";
            this.content = "";
            this.blogIdToEdit = null;
            this.fetchBlogs();
            alert("Blog updated successfully!");
          })
          .catch(error => {
            console.error(error);
            alert("Failed to update blog.");
          });
      } else {
        db4.collection("blogs").add({
          title: this.title,
          content: this.content,
          author: this.user ? this.user.email : "Anonymous",
          publication_date: new Date().toISOString(),
        })
          .then(() => {
            this.title = "";
            this.content = "";
            this.fetchBlogs();
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
        let query = db4.collection("blogs").orderBy("publication_date", "desc");
        if (this.selectedCategory) {
          query = query.where("category", "==", this.selectedCategory);
        }
        const querySnapshot = await query.get();
        this.blogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
      // Set the titleand content to the current blog's values for editing
      this.title = blog.title;
      this.content = blog.content;
      this.blogIdToEdit = blog.id;
    },
    deleteBlog(blogId) {
      const confirmation = confirm("Are you sure you want to delete this blog?");
      if (confirmation) {
        db4.collection("blogs")
          .doc(blogId)
          .delete()
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
  }
});

app4.mount('#app4');