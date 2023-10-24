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

const app = Vue.createApp({
  data() {
    return {
      user: null,
      username: "",
      password: "",
    };
  },
  mounted() {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
    });
  },
  methods: {
    loginUser() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.username, this.password)
        .then((userCredential) => {
          this.user = userCredential.user;
          this.username = "";
          this.password = "";
        })
        .catch((error) => {
          console.error(error);
          alert("Login failed. Please check your credentials.");
        });
    },
  },
});

app.mount("#app");
