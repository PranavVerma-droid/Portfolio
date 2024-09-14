const firebaseConfigLinks = {
    apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
    authDomain: "contactusform-f0ec2.firebaseapp.com",
    databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
    projectId: "contactusform-f0ec2",
    storageBucket: "contactusform-f0ec2.appspot.com",
    messagingSenderId: "641931730164",
    appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
    measurementId: "G-1RVB7HZQWB"
  };
  firebase.initializeApp(firebaseConfigLinks);
  const dbLinks = firebase.firestore();
  
  
  
    
        const appLinks = Vue.createApp({
          data() {
            return {
              socialName: "",
              socialImg: "",
              socialSource: "",
              socialIcon: "",
              socials: []
            };
          },
          mounted() {
            this.loadSocials();
          },
          methods: {
                loadSocials() {
                  dbLinks.collection("socials")
                  .orderBy("socialName", "asc")
                  .get()
                    .then(querySnapshot => {
                      const socials = [];
                      querySnapshot.forEach(doc => {
                        const social = doc.data();
                        social.id = doc.id;
                        socials.push(social);
                      });
                      this.socials = socials;
                    })
                    .catch(error => {
                      console.error(error);
                      alert("Failed to load socials.");
                    });         
                  },
              visitLink(link) {
                window.location.href = link;
            }
          }
        });
    
        appLinks.mount('#linksTable');