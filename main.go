package main


import (
    "os"
    "log"
    "net/http"
    "github.com/joho/godotenv"
    "github.com/slack-go/slack"
)




func form(w http.ResponseWriter, r *http.Request) {
    log.Println("form" + r.Method)
    switch (r.Method) {
        case "POST":
            name := r.FormValue("name")
            position := r.FormValue("position")
            leaveType := r.FormValue("leaveType")
            otherLeaveType := r.FormValue("otherLeaveType")
            startDates := r.Form["startDates[]"]
            endDates := r.Form["endDates[]"]
            startTimes := r.Form["startTimes[]"]
            endTimes := r.Form["endTimes[]"]

            log.Println(name, position, leaveType, otherLeaveType, startDates, endDates, startTimes, endTimes);
            
            
        case "GET":
            http.ServeFile(w, r, "./templates/form.html")
        default:
            http.ServeFile(w, r, "./templates/form.html")
    }
}





func main() {

    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }


    token := os.Getenv("SLACK_BOT_TOKEN")
    if token == "" {
        log.Fatal("SLACK_BOT_TOKEN is not set")
    }

    api := slack.New(token)

    channelID := "C07DLS2GUBS"
    message := "Hello, world!"

    channelID, timestamp, err := api.PostMessage(
        channelID,
        slack.MsgOptionText(message, false),
    )
    if err != nil {
        log.Fatal("Failed to send message: %v", err)
    }
    log.Println(timestamp)

    fs := http.FileServer(http.Dir("./static/"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    http.HandleFunc("/requestleave", form)

    log.Println("Listening on port 8080")
    http.ListenAndServe(":8080", nil)
}
