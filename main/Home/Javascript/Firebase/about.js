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
            class: "",
            projects: [],

            languageName: "",
            languageDescription: "",
            languageImg: "",
            languageSource: "",
            languages: [],

            certificateName: "",
            certificateIssue: "",
            certificateImg: "",
            certificateUrl: "",
            certificates: [],
          };
        },
        mounted() {
          this.loadProjects();
          this.loadAboutMe();
          this.loadLanguages();
          this.loadCertificates();

          firebase.auth().onAuthStateChanged(user => {
            this.user = user;

            this.loadAboutMe();
            this.loadProjects();
            this.loadLanguages();
            this.loadCertificates();
            });
        },
        methods: {
          loadProjects() {
            db.collection("tools")
            .orderBy("class", "asc")
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
            loadLanguages() {
              db.collection("languages")
              .orderBy("languageName", "asc")
              .get()
                .then(querySnapshot => {
                  const languages = [];
                  querySnapshot.forEach(doc => {
                    const language = doc.data();
                    language.id = doc.id;
                    languages.push(language);
                  });
                  this.languages = languages;
                })
                .catch(error => {
                  console.error(error);
                  alert("Failed to load languages.");
                });         
              },

              loadCertificates() {
                db.collection("certificates")
                .get()
                  .then(querySnapshot => {
                    const certificates = [];
                    querySnapshot.forEach(doc => {
                      const certificate = doc.data();
                      certificate.id = doc.id;
                      certificates.push(certificate);
                    });
                    this.certificates = certificates;
                  })
                  .catch(error => {
                    console.error(error);
                    alert("Failed to load certificates.");
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
            },
            visitLink(link) {
              window.location.href = link;
          }
        }
      });
  
      app.mount('#about_container');