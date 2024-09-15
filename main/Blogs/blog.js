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
    recentBlogs: []
  };
},
mounted() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');
  if (blogId) {
    this.fetchBlog(blogId); 
    this.fetchRecentBlogs(blogId);
  }
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
        .filter(doc => doc.id !== currentBlogId && !doc.data().isDraft) // Filter out drafts
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
},
});

app.mount('#app');
