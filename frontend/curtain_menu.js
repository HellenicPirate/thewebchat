/* Open when someone clicks on the span element */
function openNav() {
  document.getElementById("myNav").style.width = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

// Function to show a specific panel and hide the menu
function showPanel(panelId) {
  // 1. Hide the main menu links
  document.getElementById('mainMenu').style.display = 'none';
  
  // 2. Hide all panels (just in case)
  var panels = document.getElementsByClassName('info-panel');
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.display = 'none';
  }
  
  // 3. Show the selected panel
  document.getElementById('panel-' + panelId).style.display = 'block';
}

// Function to go back to the main menu
function showMenu() {
  // 1. Hide all panels
  var panels = document.getElementsByClassName('info-panel');
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.display = 'none';
  }
  
  // 2. Show the main menu links again
  document.getElementById('mainMenu').style.display = 'block';
}