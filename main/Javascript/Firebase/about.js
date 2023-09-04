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
            projectName: "",
            projectDescription: "",
            projectImg: "",
            projects: [],
            
            skillzName: "",
            skillzClass: "",
            skillz: []
          };
        },
        mounted() {
          this.loadProjects();
          this.loadSkillz();
        },
        methods: {
          loadProjects() {
            db.collection("about").get()
              .then(querySnapshot => {
                const projects = [];
                querySnapshot.forEach(doc => {
                  const project = doc.data();
                  project.id = doc.id;
                  projects.push(project);
                });
                this.projects = projects;
              })
              .catch(error => {
                console.error(error);
                alert("Failed to load projects.");
              });         
            },
  
              loadSkillz() {
                      db.collection("skillz").get()
                        .then(querySnapshot => {
                          const skillz = [];
                          querySnapshot.forEach(doc => {
                            const skill = doc.data();
                            skill.id = doc.id;
                            skillz.push(skill);
                          });
                          this.skillz = skillz;
                        })
                        .catch(error => {
                          console.error(error);
                          alert("Failed to load skills.");
                        });         
              }
        }
      });
  
      app.mount('#about-vue');