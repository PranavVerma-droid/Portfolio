const firebaseConfig2 = {
    apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
    authDomain: "contactusform-f0ec2.firebaseapp.com",
    databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
    projectId: "contactusform-f0ec2",
    storageBucket: "contactusform-f0ec2.appspot.com",
    messagingSenderId: "641931730164",
    appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
    measurementId: "G-1RVB7HZQWB"
};
firebase.initializeApp(firebaseConfig2);
const db2 = firebase.firestore();

const app2 = Vue.createApp({
data() {
  return {
    competitionName: "",
    competitionDescription: "",
    competitionSource: "",
    competitions: [],

    projectName: "",
    projectDescription: "",
    projectSource: "",
    projects: [],

    internshipName: "",
    internshipDescription: "",
    internshipSource: "",
    internships: [],

    class: ""
    

  };
},
mounted() {
    this.loadProjects();
    this.loadCompetitions();
    this.loadInternships();
},
methods: {
    loadProjects() {
    db2.collection("projects")
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
        alert("Failed to load projects information.");
        });
    }, 

    loadCompetitions() {
        db2.collection("competitions")
        .orderBy("class", "asc")
        .get()
            .then(querySnapshot => {
            const competitions = [];
            querySnapshot.forEach(doc => {
                const competition = doc.data();
                competition.id = doc.id;
                competitions.push(competition);
            });
            this.competitions = competitions;
            })
            .catch(error => {
            console.error(error);
            alert("Failed to load competitions information.");
            });
        },

        loadInternships() {
            db2.collection("internships")
            .orderBy("class", "asc")
            .get()
                .then(querySnapshot => {
                const internships = [];
                querySnapshot.forEach(doc => {
                    const internship = doc.data();
                    internship.id = doc.id;
                    internships.push(internship);
                });
                this.internships = internships;
                })
                .catch(error => {
                console.error(error);
                alert("Failed to load internship information.");
                });
            }
}
});

app2.mount('#work_vue');