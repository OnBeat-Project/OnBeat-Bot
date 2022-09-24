$("#logout").submit((e) => {
  e.preventDefault();
  $.post("/auth/logout", (data,status) => {
   console.log("Done, user is not connected no more.")
  })
})
