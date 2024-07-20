function showabout(){
    $("#about_container").css("display","inherit");
    $("#about_container").addClass("animate__animated animate__slideInLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animate__animated animate__slideInLeft");
    },800);
}
function closeabout(){
    $("#about_container").addClass("animate__animated animate__slideOutLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animate__animated animate__slideOutLeft");
        $("#about_container").css("display","none");
    },800);
}
function showwork(){
    $("#work_container").css("display","inherit");
    $("#work_container").addClass("animate__animated animate__slideInRight");
    setTimeout(function(){
        $("#work_container").removeClass("animate__animated animate__slideInRight");
    },800);
}
function closework(){
    $("#work_container").addClass("animate__animated animate__slideOutRight");
    setTimeout(function(){
        $("#work_container").removeClass("animate__animated animate__slideOutRight");
        $("#work_container").css("display","none");
    },800);
}
function showcontact(){
    $("#contact_container").css("display","inherit");
    $("#contact_container").addClass("animate__animated animate__slideInUp");
    setTimeout(function(){
        $("#contact_container").removeClass("animate__animated animate__slideInUp");
    },800);
}
function closecontact(){
    $("#contact_container").addClass("animate__animated animate__slideOutDown");
    setTimeout(function(){
        $("#contact_container").removeClass("animate__animated animate__slideOutDown");
        $("#contact_container").css("display","none");
    },800);
}

function showblogs() {
    $("#blogs_container").css("display", "inherit");
    $("#blogs_container").addClass("animate__slideInDown animate__animated");
    setTimeout(function () {
        $("#blogs_container").removeClass("animate__slideInDown animate__animated");
    }, 800);
}

function closeblogs() {
    $("#blogs_container").addClass("animate__slideOutUp animate__animated");
    setTimeout(function () {
        $("#blogs_container").css("display", "none");
        $("#blogs_container").removeClass("animate__slideOutUp animate__animated");
    }, 800);
}

function showResume() {
    var resumeURL = "https://firebasestorage.googleapis.com/v0/b/contactusform-f0ec2.appspot.com/o/Resume%2FPranav%E2%80%99s%20Resume%201.pdf?alt=media&token=7018b85b-3124-48a8-92a5-ae7fc4c53f15";
    
    window.open(resumeURL, "_blank");
}

setTimeout(function(){
    $("#loading").addClass("animate__animated animate__fadeOut");
    setTimeout(function(){
      $("#loading").removeClass("animate__animated animate__fadeOut");
      $("#loading").css("display","none");
      $("#box").css("display","none");
      $("#about").removeClass("animate__animated animate__fadeIn");
      $("#contact").removeClass("animate__animated animate__fadeIn");
      $("#work").removeClass("animate__animated animate__fadeIn");
      $("#blogs").removeClass("animate__animated animate__fadeIn");
    },1000);
},1500);
