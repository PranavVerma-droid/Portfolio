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
const realdb = firebase.database();



  
      const app = Vue.createApp({
        data() {
          return {
            user: null,
            email: "",
            password: "",
            projectName: "",
            projectDescription: "",
            projectImg: "",
            projects: [],
          };
        },
        mounted() {
          this.loadProjects();
          this.loadAboutMe();

          firebase.auth().onAuthStateChanged(user => {
            this.user = user;
            this.loadProjects();
            this.loadAboutMe();
            });
        },
        methods: {
            login() {
              firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(userCredential => {
                  this.user = userCredential.user;
                  this.email = "";
                  this.password = "";
                  this.loadProjects();
                })
                .catch(error => {
                  console.error(error);
                  alert("Login failed. Please check your credentials.");
                });
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
          submitProject() {
  
            db.collection("about").add({
              projectName: this.projectName,
              projectDescription: this.projectDescription,
              projectImg: this.projectImg,
              author: this.user ? this.user.email : "Anonymous",
              publication_date: new Date().toISOString(),
            })
            .then(() => {
              this.projectName = "";
              this.projectDescription = "";
              this.projectImg = "";
              alert("Project submitted successfully!");
              this.loadProjects();
            })
            .catch(error => {
              console.error(error);
              alert("Project to submit blog.");
            });
            
            },

            loginWithGoogle() {
              const provider = new firebase.auth.GoogleAuthProvider();
              firebase.auth().signInWithPopup(provider)
                .then(result => {
                  this.user = result.user;
                  this.loadProjects();
                })
                .catch(error => {
                  console.error(error);
                  alert("Google Sign-In failed. Please try again.");
                });
            },
            
          loadProjects() {
            db.collection("about")
            .orderBy("projectName", "asc")
            .get()
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
              loadAboutMe() {
                const aboutMeRef = realdb.ref('info/about-me');
            
                aboutMeRef.on('value', (snapshot) => {
                    const aboutMeText = snapshot.val();
                    const aboutMePlaceholder = document.getElementById('about-me-placeholder');
            
                    if (aboutMeText) {
                        aboutMePlaceholder.textContent = aboutMeText;
                    } else {
                        aboutMePlaceholder.textContent = 'No about me information available.';
                    }
                });
            }
        }
      });
  
      app.mount('#about_container');