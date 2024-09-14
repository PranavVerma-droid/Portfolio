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
        blog: null, 
      };
    },
    mounted() {
      const urlParams = new URLSearchParams(window.location.search);
      const blogId = urlParams.get('id');
      if (blogId) {
        this.fetchBlog(blogId); 
      }
    },
    methods: {
      async fetchBlog(blogId) {
        try {
          const blogDoc = await db4.collection('blogs').doc(blogId).get();
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
  
  app4.mount('#app4');
  