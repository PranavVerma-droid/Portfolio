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
  
  // Initialize Firebase using the v8 syntax
  firebase.initializeApp(firebaseConfig4);
  const db4 = firebase.firestore();
  
  const app4 = Vue.createApp({
    data() {
      return {
        blog: null,  // This will store the fetched blog data
      };
    },
    mounted() {
      const urlParams = new URLSearchParams(window.location.search);
      const blogId = urlParams.get('id');  // Fetch the 'id' from the URL
      if (blogId) {
        this.fetchBlog(blogId);  // Fetch the blog data using the blog ID
      }
    },
    methods: {
      // Method to fetch the blog based on the ID
      async fetchBlog(blogId) {
        try {
          const blogDoc = await db4.collection('blogs').doc(blogId).get();
          if (blogDoc.exists) {
            this.blog = blogDoc.data();  // Store the blog data in the 'blog' object
          } else {
            alert("Blog not found.");
          }
        } catch (error) {
          console.error(error);
          alert("Failed to fetch blog.");
        }
      },
      goBack() {
        window.location.href = "index.html";  // Adjust the path to your homepage or blog list page
      },
      // Method to format the publication date
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
  
  app4.mount('#app4');
  