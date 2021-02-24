
if(document.getElementById("becomeGuideForm")){
    document.getElementById("becomeGuideForm").addEventListener("submit", (e) => {
        e.preventDefault(); 
        document.getElementById("btnBecomeGuide").innerText = "Sending Mail..";
        setTimeout(() => {
            document.getElementById("btnBecomeGuide").innerText = "Send";
            showAlert("success", "We have Recived your mail, we'll get in touch with you soon.");
            window.scrollTo(0, 0); 
        }, 1500);
        setTimeout(() => {
            location.assign("/");   
        }, 5000);
        
    })
}

